/**
 * Estado em memória da defesa anti-payment: deduplicação por autor e
 * "incidente" de grupo coalescido.
 *
 * O handler antigo fechava e reabria o grupo uma vez POR mensagem. Sob rajada
 * (vários pagamentos quase simultâneos, às vezes do mesmo autor) isso fazia o
 * grupo piscar, repetia a limpeza e às vezes reabria o grupo antes de todos
 * serem removidos. Aqui:
 *
 * - cada autor distinto é removido UMA vez (TTL curto evita reprocessar o mesmo);
 * - remoção e revogação da mensagem rodam em PARALELO;
 * - o grupo fecha e é limpo UMA vez por incidente (compartilhado entre autores);
 * - a reabertura é "debounced": acontece uma vez, GROUP_INCIDENT_TTL_MS após a
 *   última ameaça, em vez de uma reabertura por mensagem.
 *
 * Tudo é volátil de propósito, como o messageEnvelopeRegistry: o modo de falha
 * ao reiniciar é ficar mais conservador, nunca menos seguro.
 *
 * @author Dev Gui
 */
import { sendCleanChat } from "./cleanChat.js";
import { deletePaymentMessageWithFallback } from "./deletePaymentMessage.js";
import { errorLog } from "./logger.js";

const RECENT_PARTICIPANT_TTL_MS = 60 * 1000;
const RECENT_PRUNE_INTERVAL_MS = 30 * 1000;
const DEFAULT_GROUP_INCIDENT_TTL_MS = 8 * 1000;

let groupIncidentTtlMs = DEFAULT_GROUP_INCIDENT_TTL_MS;

const recentlyHandled = new Map(); // `${remoteJid}:${userLid}` -> expiresAt
const inFlight = new Map(); // `${remoteJid}:${userLid}` -> Promise<boolean>
const groupIncidents = new Map(); // remoteJid -> { closePromise, groupClosed, reopenTimer }

let lastPruneAt = 0;

function participantKey(remoteJid, userLid) {
  return `${remoteJid}:${userLid}`;
}

async function runStep(step, errorMessage) {
  try {
    await step();
  } catch (error) {
    errorLog(`${errorMessage} Detalhes: ${error.message}`);
  }
}

function pruneRecentlyHandled() {
  const now = Date.now();

  if (now - lastPruneAt < RECENT_PRUNE_INTERVAL_MS) {
    return;
  }

  lastPruneAt = now;

  for (const [key, expiresAt] of recentlyHandled) {
    if (expiresAt <= now) {
      recentlyHandled.delete(key);
    }
  }
}

/**
 * Garante UM incidente por grupo: fecha o grupo e limpa o chat uma única vez,
 * compartilhando a mesma promessa entre todos os autores da mesma rajada.
 */
function ensureGroupIncident(socket, remoteJid) {
  const existing = groupIncidents.get(remoteJid);

  if (existing) {
    return existing;
  }

  const incident = { groupClosed: false, reopenTimer: undefined };

  incident.closePromise = (async () => {
    await runStep(
      () => socket.groupSettingUpdate(remoteJid, "announcement"),
      "Erro ao fechar o grupo pelo anti-payment.",
    );

    incident.groupClosed = true;

    await sendCleanChat({ socket, remoteJid });
  })();

  groupIncidents.set(remoteJid, incident);

  return incident;
}

/**
 * Reabre o grupo de forma debounced: cada nova ameaça reposiciona o timer, então
 * o grupo só reabre GROUP_INCIDENT_TTL_MS após a ÚLTIMA mensagem da rajada.
 */
function scheduleGroupReopen(socket, remoteJid) {
  const incident = groupIncidents.get(remoteJid);

  if (!incident) {
    return;
  }

  if (!incident.groupClosed) {
    // O fechamento falhou: nada a reabrir. Libera o incidente para nova tentativa.
    groupIncidents.delete(remoteJid);
    return;
  }

  if (incident.reopenTimer) {
    clearTimeout(incident.reopenTimer);
  }

  incident.reopenTimer = setTimeout(() => {
    runStep(
      () => socket.groupSettingUpdate(remoteJid, "not_announcement"),
      "Erro ao abrir o grupo pelo anti-payment.",
    ).finally(() => {
      if (groupIncidents.get(remoteJid) === incident) {
        groupIncidents.delete(remoteJid);
      }
    });
  }, groupIncidentTtlMs);

  incident.reopenTimer.unref?.();
}

async function runDefense({ socket, remoteJid, userLid, messageKey }) {
  const incident = ensureGroupIncident(socket, remoteJid);

  let removed = false;

  await Promise.all([
    incident.closePromise,
    socket
      .groupParticipantsUpdate(remoteJid, [userLid], "remove")
      .then(() => {
        removed = true;
      })
      .catch((error) => {
        errorLog(
          `Erro ao banir membro pelo anti-payment. Detalhes: ${error.message}`,
        );
      }),
    // Best-effort: payments quase nunca saem com delete admin puro.
    // Roda em paralelo com ban/fechamento; se o hack falhar, cai no delete normal.
    messageKey
      ? runStep(
          () =>
            deletePaymentMessageWithFallback({
              socket,
              remoteJid,
              messageKey,
              settleMs: 250,
            }),
          "Erro ao apagar a mensagem de pagamento.",
        )
      : Promise.resolve(),
  ]);

  scheduleGroupReopen(socket, remoteJid);

  if (removed) {
    recentlyHandled.set(
      participantKey(remoteJid, userLid),
      Date.now() + RECENT_PARTICIPANT_TTL_MS,
    );
  }

  return removed;
}

/**
 * Defende o grupo de uma mensagem de pagamento, deduplicando por autor e
 * coalescendo o fechamento/limpeza/reabertura. A remoção só é marcada como
 * "recente" quando de fato funciona, então uma remoção que falhou NÃO suprime as
 * próximas mensagens do mesmo autor.
 *
 * @returns {Promise<boolean>} true se o autor foi (ou já estava sendo) removido.
 */
export function defendAgainstPayment({ socket, remoteJid, userLid, messageKey }) {
  if (!remoteJid || !userLid) {
    return Promise.resolve(false);
  }

  pruneRecentlyHandled();

  const key = participantKey(remoteJid, userLid);
  const expiresAt = recentlyHandled.get(key);

  if (expiresAt && expiresAt > Date.now()) {
    return Promise.resolve(true);
  }

  const existing = inFlight.get(key);

  if (existing) {
    return existing;
  }

  const defense = Promise.resolve().then(() =>
    runDefense({ socket, remoteJid, userLid, messageKey }),
  );

  inFlight.set(key, defense);

  return defense.finally(() => {
    if (inFlight.get(key) === defense) {
      inFlight.delete(key);
    }
  });
}

/**
 * Apenas para testes: zera o estado e restaura o TTL padrão.
 */
export function __clearPaymentDefenseState() {
  for (const incident of groupIncidents.values()) {
    if (incident.reopenTimer) {
      clearTimeout(incident.reopenTimer);
    }
  }

  recentlyHandled.clear();
  inFlight.clear();
  groupIncidents.clear();
  lastPruneAt = 0;
  groupIncidentTtlMs = DEFAULT_GROUP_INCIDENT_TTL_MS;
}

/**
 * Apenas para testes: encurta a janela de reabertura debounced.
 */
export function __setGroupIncidentTtlForTests(ms) {
  groupIncidentTtlMs = ms;
}
