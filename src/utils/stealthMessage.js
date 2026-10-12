/**
 * Detecção de "mensagem invisível" (anti-stealth).
 *
 * A mensagem invisível é uma divulgação enviada com a chave de sessão do grupo
 * propositalmente retida (sender-key-withheld): o WhatsApp entrega o stanza, mas
 * o bot NÃO consegue decifrar o conteúdo. Ela nunca vira um evento `message`,
 * então nenhum anti-* baseado em conteúdo (anti-link, anti-product, anti-payment)
 * chega a rodar — o membro do grupo lê a divulgação, o bot não.
 *
 * O que sobra é o stanza cru: o zapo não encontra handler para ele e emite
 * `debug_unhandled_stanza` com `reason = "message.decrypt_failed.skmsg"`. Isso é
 * o suficiente para saber QUEM enviou e QUAL id, mesmo sem saber o conteúdo.
 *
 * Este módulo só interpreta o stanza. A decisão de punir vive em
 * `antiStealthAction.js`, e é deliberadamente conservadora: uma falha isolada é
 * ruído de sessão dessincronizada, não ataque.
 *
 * @author Dev Gui
 */

export const STEALTH_FAILURE_REASON = "message.decrypt_failed.skmsg";

/**
 * @typedef {{
 *   groupJid: string,
 *   author: string | null,
 *   authorIds: string[],
 *   messageId: string | null,
 *   hiddenAttribute: boolean,
 *   ciphertextBytes: number | null,
 *   encryptionType: "skmsg",
 *   failureReason: string,
 * }} StealthDetection
 */

export function sanitizeStealthJid(jid) {
  if (!jid) {
    return "";
  }

  return jid.replace(/:\d+@/, "@");
}

function getChildren(node) {
  return Array.isArray(node?.content) ? node.content : [];
}

function getCiphertextBytes(node) {
  if (node?.content instanceof Uint8Array) {
    return node.content.byteLength;
  }

  if (typeof node?.content === "string") {
    return node.content.length;
  }

  return null;
}

function getAuthorIds(node) {
  const attrs = node?.attrs || {};

  const ids = [
    attrs.participant,
    attrs.participant_pn,
    attrs.participant_lid,
    attrs.sender_pn,
    attrs.sender_lid,
  ]
    .map(sanitizeStealthJid)
    .filter(Boolean);

  return [...new Set(ids)];
}

/**
 * Traduz um `debug_unhandled_stanza` em uma detecção de mensagem invisível.
 * Retorna null para qualquer stanza que não seja falha de `skmsg` em grupo.
 *
 * @returns {StealthDetection | null}
 */
export function parseStealthFailure(event) {
  if (!event || event.reason !== STEALTH_FAILURE_REASON) {
    return null;
  }

  const groupJid = sanitizeStealthJid(
    event.chatJid || event.rawNode?.attrs?.from,
  );

  if (!groupJid.endsWith("@g.us")) {
    return null;
  }

  const encryptedNode = getChildren(event.rawNode).find(
    (node) => node?.tag === "enc" && node?.attrs?.type === "skmsg",
  );

  if (!encryptedNode) {
    return null;
  }

  const authorIds = getAuthorIds(event.rawNode);

  return {
    groupJid,
    author: authorIds[0] ?? null,
    authorIds,
    messageId: event.stanzaId || event.rawNode?.attrs?.id || null,
    // `decrypt-fail=hide` marca a classe reação/pin: ruído de sessão, não cabe
    // uma divulgação dentro dela.
    hiddenAttribute: encryptedNode.attrs?.["decrypt-fail"] === "hide",
    ciphertextBytes: getCiphertextBytes(encryptedNode),
    encryptionType: "skmsg",
    failureReason: STEALTH_FAILURE_REASON,
  };
}

/**
 * Escuta falhas de decriptação de grupo no cliente zapo.
 *
 * @param {import("zapo-js").WaClient} client
 * @param {(detection: StealthDetection) => void} listener
 * @returns {() => void} função para cancelar a inscrição
 */
export function subscribeStealthFailures(client, listener) {
  const onUnhandledStanza = (event) => {
    const detection = parseStealthFailure(event);

    if (detection) {
      listener(detection);
    }
  };

  client.on("debug_unhandled_stanza", onUnhandledStanza);

  return () => client.off("debug_unhandled_stanza", onUnhandledStanza);
}
