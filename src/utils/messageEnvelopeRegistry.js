/**
 * Registro em memória dos envelopes de mensagens recebidas por grupo.
 *
 * Serve para CORROBORAR marcações (quoted) de pagamento e impedir banimento de
 * inocentes por marcação forjada: o contextInfo.participant/quotedMessage é
 * fornecido pelo cliente e pode ser fabricado. Antes de punir o autor citado,
 * exigimos que o bot tenha realmente recebido aquela mensagem original, do mesmo
 * autor, e que ela não tenha sido lida como "não-pagamento".
 *
 * Tudo é volátil de propósito: marcações relevantes acontecem em minutos. Se o
 * bot reiniciar e perder o histórico, o modo de falha é ficar mais conservador
 * (não corrobora -> não bane), nunca menos seguro.
 *
 * @author Dev Gui
 */

const ENVELOPE_TTL_MS = 60 * 60 * 1000;
const MAX_ENTRIES_PER_GROUP = 1000;

const registry = new Map();

const NON_CONTENT_KEYS = new Set([
  "messageContextInfo",
  "senderKeyDistributionMessage",
]);

function hasReadableContent(message) {
  if (!message || typeof message !== "object") {
    return false;
  }

  return Object.keys(message).some((key) => !NON_CONTENT_KEYS.has(key));
}

function pruneGroup(groupMap) {
  const now = Date.now();

  for (const [id, entry] of groupMap) {
    if (now - entry.ts > ENVELOPE_TTL_MS) {
      groupMap.delete(id);
    }
  }

  while (groupMap.size > MAX_ENTRIES_PER_GROUP) {
    const oldestKey = groupMap.keys().next().value;

    if (oldestKey === undefined) {
      break;
    }

    groupMap.delete(oldestKey);
  }
}

/**
 * Registra o envelope de uma mensagem de grupo. isPayment é calculado pelo
 * chamador (que já roda a detecção de pagamento) para evitar import cíclico.
 */
export function recordMessageEnvelope(webMessage, isPayment) {
  const remoteJid = webMessage?.key?.remoteJid;
  const id = webMessage?.key?.id;
  const participantAlt = webMessage?.key?.participantAlt;
  const participant = webMessage?.key?.participant || participantAlt;

  if (!remoteJid?.endsWith("@g.us") || !id || !participant) {
    return;
  }

  let groupMap = registry.get(remoteJid);

  if (!groupMap) {
    groupMap = new Map();
    registry.set(remoteJid, groupMap);
  }

  const contentState = isPayment
    ? "payment"
    : hasReadableContent(webMessage?.message)
      ? "other"
      : "unreadable";

  groupMap.set(id, {
    participant,
    participantAlt,
    contentState,
    stealth: Boolean(webMessage?.stealthMeta),
    ts: Date.now(),
  });

  pruneGroup(groupMap);
}

/**
 * Decide se uma marcação de pagamento é confiável o bastante para punir o autor.
 *
 * - corroborated: o bot recebeu a mensagem original, do MESMO autor, e ela era
 *   pagamento OU foi indecifrável (consistente com o truque stealth). Pode punir.
 * - contradicted: o bot recebeu a mensagem, mas de OUTRO autor, ou ela era um
 *   conteúdo legível que NÃO era pagamento. É forja. Nunca punir.
 * - nenhum dos dois: o bot não viu a mensagem original. Sem corroboração, não pune.
 */
export function verifyQuotedAuthor({ groupJid, stanzaId, participant }) {
  if (!stanzaId) {
    return { corroborated: false, contradicted: false };
  }

  const entry = registry.get(groupJid)?.get(stanzaId);

  if (!entry) {
    return { corroborated: false, contradicted: false };
  }

  if (entry.participant !== participant && entry.participantAlt !== participant) {
    return { corroborated: false, contradicted: true };
  }

  if (entry.contentState === "other") {
    return { corroborated: false, contradicted: true };
  }

  return { corroborated: true, contradicted: false };
}

/**
 * Apenas para testes: limpa o registro.
 */
export function __clearEnvelopeRegistry() {
  registry.clear();
}
