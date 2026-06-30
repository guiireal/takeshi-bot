const MAX_PAYMENT_SCAN_DEPTH = 8;
const PAYMENT_MESSAGE_KEYS = new Set([
  "paymentInviteMessage",
  "requestPaymentMessage",
  "sendPaymentMessage",
  "cancelPaymentRequestMessage",
  "declinePaymentRequestMessage",
  "invoiceMessage",
]);

function canScanObject(value) {
  return (
    value &&
    typeof value === "object" &&
    !(value instanceof ArrayBuffer) &&
    !ArrayBuffer.isView(value)
  );
}

function hasPaymentMessageKey(value, depth = 0, seenObjects = new WeakSet()) {
  if (
    !canScanObject(value) ||
    depth > MAX_PAYMENT_SCAN_DEPTH ||
    seenObjects.has(value)
  ) {
    return false;
  }

  seenObjects.add(value);

  for (const [key, childValue] of Object.entries(value)) {
    if (key === "quotedMessage") {
      continue;
    }

    if (PAYMENT_MESSAGE_KEYS.has(key) && canScanObject(childValue)) {
      return true;
    }

    if (hasPaymentMessageKey(childValue, depth + 1, seenObjects)) {
      return true;
    }
  }

  return false;
}

export function hasPaymentMessage(webMessage) {
  return hasPaymentMessageKey(webMessage?.message);
}

function findQuotedPaymentContext(value, depth = 0, seenObjects = new WeakSet()) {
  if (
    !canScanObject(value) ||
    depth > MAX_PAYMENT_SCAN_DEPTH ||
    seenObjects.has(value)
  ) {
    return null;
  }

  seenObjects.add(value);

  const contextInfo = value.contextInfo;

  if (
    canScanObject(contextInfo) &&
    typeof contextInfo.participant === "string" &&
    canScanObject(contextInfo.quotedMessage) &&
    hasPaymentMessageKey(contextInfo.quotedMessage)
  ) {
    return {
      participant: contextInfo.participant,
      stanzaId:
        typeof contextInfo.stanzaId === "string"
          ? contextInfo.stanzaId
          : undefined,
    };
  }

  for (const [key, childValue] of Object.entries(value)) {
    if (key === "quotedMessage") {
      continue;
    }

    const found = findQuotedPaymentContext(childValue, depth + 1, seenObjects);

    if (found) {
      return found;
    }
  }

  return null;
}

/**
 * Lê a marcação (quoted) de uma mensagem de pagamento — inclusive as enviadas
 * de forma oculta para admins — e devolve o AUTOR ORIGINAL e o id da mensagem
 * citada. Ignora citações aninhadas para não atribuir o pagamento errado.
 */
export function getQuotedPaymentContext(webMessage) {
  return findQuotedPaymentContext(webMessage?.message);
}
