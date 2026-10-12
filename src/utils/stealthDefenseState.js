/**
 * Estado em memória da defesa anti-stealth.
 *
 * Uma falha de decriptação isolada é normal: sessão dessincronizada, aparelho
 * que voltou do offline, reentrega. Punir por isso remove inocente. O que NÃO é
 * normal é uma rajada — várias mensagens indecifráveis do mesmo autor em poucos
 * segundos. Este módulo contabiliza por autor, deduplica reentregas do mesmo id,
 * e coalesce o fechamento/reabertura do grupo em UM incidente, no mesmo espírito
 * do `paymentDefenseState.js`.
 *
 * Mensagens marcadas com `decrypt-fail=hide` (classe reação/pin) NÃO contam:
 * não cabe divulgação nelas, então só somariam ruído à contagem.
 *
 * Tudo é volátil de propósito: reiniciar o bot zera a contagem, e o modo de
 * falha é ficar mais conservador (não pune), nunca menos seguro.
 *
 * @author Dev Gui
 */

const MESSAGE_DEDUP_TTL_MS = 60 * 1000;
const AUTHOR_WINDOW_MS = 30 * 1000;
/**
 * Depois de conter um autor, a rajada seguinte dele é apenas revogada, sem
 * tentar remover de novo, por esta janela.
 */
const AUTHOR_HANDLED_COOLDOWN_MS = 60 * 1000;
/**
 * O grupo reabre este tanto de tempo DEPOIS da última mensagem invisível
 * (debounce): enquanto a rajada continua, o timer é empurrado e o grupo
 * segue fechado.
 */
export const REOPEN_QUIET_MS = 8 * 1000;

const recentlyHandledMessages = new Map(); // `${groupJid}:${author}:${id}` -> expiresAt
const messagesByAuthor = new Map(); // `${groupJid}:${author}` -> Map<id, AuthorMessage>
const handledAuthors = new Map(); // `${groupJid}:${author}` -> expiresAt
const groupIncidents = new Map(); // groupJid -> incidente

/**
 * @typedef {{
 *   receivedAt: number,
 *   hidden: boolean,
 *   revoked: boolean,
 * }} AuthorMessage
 */

function authorKey(groupJid, author) {
  return `${groupJid}:${author}`;
}

function messageKey(groupJid, author, messageId) {
  return `${groupJid}:${author}:${messageId}`;
}

function countVisible(authorMessages) {
  let visibleCount = 0;

  for (const message of authorMessages.values()) {
    if (!message.hidden) {
      visibleCount += 1;
    }
  }

  return visibleCount;
}

/**
 * Contabiliza uma mensagem invisível por autor, sem efeito colateral no grupo.
 *
 * @returns {{
 *   duplicate: boolean,
 *   upgraded: boolean,
 *   repeated: boolean,
 *   visibleCount: number,
 * }} `duplicate`: mesmo id já contabilizado. `upgraded`: a reentrega tirou a
 * classificação `hide`, então a mensagem passa a contar. `repeated`: segunda
 * mensagem distinta do autor na janela. `visibleCount`: quantas mensagens da
 * janela NÃO eram da classe reação/pin.
 */
export function registerStealthMessage({
  groupJid,
  author,
  messageId,
  hidden = false,
}) {
  const now = Date.now();

  for (const [key, expiresAt] of recentlyHandledMessages) {
    if (expiresAt <= now) {
      recentlyHandledMessages.delete(key);
    }
  }

  const dedupKey = messageKey(groupJid, author, messageId);
  const key = authorKey(groupJid, author);
  const authorMessages = messagesByAuthor.get(key) ?? new Map();

  for (const [id, message] of authorMessages) {
    if (now - message.receivedAt > AUTHOR_WINDOW_MS) {
      authorMessages.delete(id);
    }
  }

  if ((recentlyHandledMessages.get(dedupKey) ?? 0) > now) {
    const existing = authorMessages.get(messageId);
    const upgraded = !!(existing?.hidden && !hidden);

    if (upgraded) {
      existing.hidden = false;
    }

    return {
      duplicate: true,
      upgraded,
      repeated: authorMessages.size >= 2,
      visibleCount: countVisible(authorMessages),
    };
  }

  recentlyHandledMessages.set(dedupKey, now + MESSAGE_DEDUP_TTL_MS);
  authorMessages.set(messageId, { receivedAt: now, hidden, revoked: false });
  messagesByAuthor.set(key, authorMessages);

  return {
    duplicate: false,
    upgraded: false,
    repeated: authorMessages.size >= 2,
    visibleCount: countVisible(authorMessages),
  };
}

/**
 * Devolve, em ordem de chegada, os ids da janela que ainda não foram revogados
 * (ignorando reação/pin) e já os marca. As primeiras mensagens da rajada ficam
 * de lado de propósito — só quando a rajada se confirma elas viram alvo, e este
 * método garante que cada uma seja revogada uma única vez.
 *
 * @returns {string[]}
 */
export function takeStealthMessagesToRevoke({ groupJid, author }) {
  const authorMessages = messagesByAuthor.get(authorKey(groupJid, author));

  if (!authorMessages) {
    return [];
  }

  const pending = [];

  for (const [id, message] of authorMessages) {
    if (message.hidden || message.revoked) {
      continue;
    }

    message.revoked = true;
    pending.push(id);
  }

  return pending;
}

/** Indica se este autor já foi contido há pouco. */
export function isStealthAuthorHandled({ groupJid, author }) {
  const key = authorKey(groupJid, author);
  const expiresAt = handledAuthors.get(key);

  if (expiresAt === undefined) {
    return false;
  }

  if (expiresAt <= Date.now()) {
    handledAuthors.delete(key);
    return false;
  }

  return true;
}

/** Marca o autor como contido e zera o histórico de contagem dele. */
export function markStealthAuthorHandled({ groupJid, author }) {
  const key = authorKey(groupJid, author);

  handledAuthors.set(key, Date.now() + AUTHOR_HANDLED_COOLDOWN_MS);
  messagesByAuthor.delete(key);
}

/**
 * Garante que o grupo esteja contido (fechado) e agenda/renova a reabertura com
 * debounce. Na primeira mensagem do incidente chama `closeIfOpen`; nas seguintes
 * só empurra o timer, mantendo o grupo fechado durante a rajada. A reabertura
 * (`reopen`) só roda quando FOMOS nós que fechamos — grupo que já estava fechado
 * pelos admins continua fechado.
 */
export async function touchGroupContainment({
  groupJid,
  closeIfOpen,
  reopen,
  quietMs = REOPEN_QUIET_MS,
  scheduleReopen = true,
}) {
  let incident = groupIncidents.get(groupJid);

  if (!incident) {
    incident = { closedByBot: false };
    groupIncidents.set(groupJid, incident);

    incident.closePromise = Promise.resolve()
      .then(closeIfOpen)
      .then((closedByBot) => {
        incident.closedByBot = !!closedByBot;
      })
      .finally(() => {
        incident.closePromise = undefined;
      });
  }

  await incident.closePromise;

  incident.reopen = reopen;

  if (incident.reopenTimer) {
    clearTimeout(incident.reopenTimer);
    incident.reopenTimer = undefined;
  }

  if (!scheduleReopen) {
    return;
  }

  incident.reopenTimer = setTimeout(() => {
    runGroupReopen(groupJid);
  }, quietMs);

  incident.reopenTimer.unref?.();
}

function runGroupReopen(groupJid) {
  const incident = groupIncidents.get(groupJid);

  if (!incident) {
    return Promise.resolve();
  }

  groupIncidents.delete(groupJid);

  if (!incident.closedByBot || !incident.reopen) {
    return Promise.resolve();
  }

  return Promise.resolve().then(incident.reopen);
}

export function __clearStealthDefenseState() {
  recentlyHandledMessages.clear();
  messagesByAuthor.clear();
  handledAuthors.clear();

  for (const incident of groupIncidents.values()) {
    if (incident.reopenTimer) {
      clearTimeout(incident.reopenTimer);
    }
  }

  groupIncidents.clear();
}

/**
 * Apenas para testes: dispara imediatamente as reaberturas pendentes (o que o
 * timer de debounce faria após o período de silêncio).
 */
export async function __flushGroupReopens() {
  const groupJids = [...groupIncidents.entries()]
    .filter(([, incident]) => !!incident.reopenTimer)
    .map(([groupJid]) => groupJid);

  for (const groupJid of groupJids) {
    const incident = groupIncidents.get(groupJid);

    if (incident?.reopenTimer) {
      clearTimeout(incident.reopenTimer);
    }

    await runGroupReopen(groupJid);
  }
}
