/**
 * Janela de graça entre a falha de decriptação e a punição.
 *
 * O WhatsApp reentrega mensagens que falharam: o bot pede a sessão de novo e,
 * segundos depois, a MESMA mensagem chega decifrada como evento `message`
 * normal. Se punirmos na hora da falha, removemos gente cuja mensagem era
 * legítima e só chegou atrasada.
 *
 * Então toda detecção espera `STEALTH_RETRY_GRACE_MS`. Se a mensagem aparecer
 * legível nesse intervalo, a defesa é cancelada e o fluxo normal (anti-link,
 * anti-product, ...) trata o conteúdo. Se não aparecer, aí sim ela é tratada
 * como invisível.
 *
 * @author Dev Gui
 */

export const STEALTH_RETRY_GRACE_MS = 5 * 1000;

const NON_CONTENT_KEYS = new Set([
  "messageContextInfo",
  "senderKeyDistributionMessage",
]);

const pendingRetries = new Map(); // `${groupJid}:${messageId}` -> pendência

function hasReadableContent(webMessage) {
  const message = webMessage?.message;

  if (!message || typeof message !== "object") {
    return false;
  }

  return Object.entries(message).some(
    ([key, value]) => value != null && !NON_CONTENT_KEYS.has(key),
  );
}

/**
 * Aguarda a possível reentrega decifrada da mensagem detectada.
 *
 * @returns {Promise<boolean>} true se a mensagem chegou legível a tempo
 * (defesa deve ser abortada), false se a janela expirou.
 */
export function waitForStealthRetry(detection, graceMs = STEALTH_RETRY_GRACE_MS) {
  const { groupJid, messageId } = detection || {};

  if (!groupJid || !messageId) {
    return Promise.resolve(false);
  }

  const key = `${groupJid}:${messageId}`;
  const existing = pendingRetries.get(key);

  if (existing) {
    return existing.promise;
  }

  let resolveRetry = () => {};

  const promise = new Promise((resolve) => {
    resolveRetry = resolve;
  });

  const timer = setTimeout(() => {
    if (pendingRetries.get(key)?.promise === promise) {
      pendingRetries.delete(key);
    }

    resolveRetry(false);
  }, graceMs);

  timer.unref?.();

  pendingRetries.set(key, {
    authorIds: detection.authorIds || [],
    promise,
    resolve: resolveRetry,
    timer,
  });

  return promise;
}

/**
 * Informa que uma mensagem chegou pelo fluxo normal. Se ela for a reentrega de
 * uma detecção pendente, do MESMO autor, cancela a defesa.
 *
 * @returns {boolean} true se cancelou uma defesa pendente.
 */
export function resolveStealthRetry(webMessage) {
  const groupJid = webMessage?.key?.remoteJid;
  const messageId = webMessage?.key?.id;

  if (!groupJid || !messageId || !hasReadableContent(webMessage)) {
    return false;
  }

  const pending = pendingRetries.get(`${groupJid}:${messageId}`);

  if (!pending) {
    return false;
  }

  const participantIds = [
    webMessage.key?.participant,
    webMessage.key?.participantAlt,
  ].filter(Boolean);

  if (
    pending.authorIds.length &&
    !participantIds.some((participant) =>
      pending.authorIds.includes(participant),
    )
  ) {
    return false;
  }

  clearTimeout(pending.timer);
  pendingRetries.delete(`${groupJid}:${messageId}`);
  pending.resolve(true);

  return true;
}

export function __clearStealthRetryState() {
  for (const pending of pendingRetries.values()) {
    clearTimeout(pending.timer);
    pending.resolve(false);
  }

  pendingRetries.clear();
}
