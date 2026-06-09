const MAX_PAYMENT_SCAN_DEPTH = 8;
const PAYMENT_MESSAGE_KEYS = new Set(["requestPaymentMessage"]);

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
