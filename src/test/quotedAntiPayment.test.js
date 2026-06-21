import assert from "node:assert";
import { beforeEach, describe, it } from "node:test";
import { messageHandler } from "../middlewares/messageHandler.js";
import { useGroupRestrictionsCleanup } from "./helpers/groupRestrictions.js";
import {
  __clearEnvelopeRegistry,
  recordMessageEnvelope,
} from "../utils/messageEnvelopeRegistry.js";
import { getQuotedPaymentContext } from "../utils/paymentMessage.js";
import * as database from "../utils/database.js";

const remoteJid = "quoted-anti-payment-test@g.us";
const quoterLid = "111111111@lid";
const authorLid = "222222222@lid";
const originalStanzaId = "ORIGINAL_PAYMENT_ID";

function buildQuotedPaymentWebMessage() {
  return {
    key: {
      remoteJid,
      fromMe: false,
      id: "reply-message-id",
      participant: quoterLid,
    },
    message: {
      extendedTextMessage: {
        text: "olha esse golpista",
        contextInfo: {
          participant: authorLid,
          stanzaId: originalStanzaId,
          quotedMessage: {
            requestPaymentMessage: { currencyCodeIso4217: "BRL" },
          },
        },
      },
    },
  };
}

// Simula o bot tendo recebido a mensagem ORIGINAL de pagamento (indecifrável,
// como no truque stealth). É o que corrobora a marcação.
function recordOriginalPayment(participant = authorLid, id = originalStanzaId) {
  recordMessageEnvelope(
    { key: { remoteJid, id, participant }, message: null },
    false,
  );
}

function createSocket(calls, participants) {
  return {
    groupMetadata: async () => ({ owner: "owner@lid", participants }),
    groupSettingUpdate: async (...args) => {
      calls.push(["groupSettingUpdate", ...args]);
    },
    groupParticipantsUpdate: async (...args) => {
      calls.push(["groupParticipantsUpdate", ...args]);
    },
    sendMessage: async (...args) => {
      calls.push(["sendMessage", ...args]);
    },
    relayMessage: async (...args) => {
      calls.push(["relayMessage", ...args]);
    },
  };
}

const removeCalls = (calls) =>
  calls.filter(
    (call) => call[0] === "groupParticipantsUpdate" && call[3] === "remove",
  );

describe("quoted anti-payment", () => {
  useGroupRestrictionsCleanup(() => {
    database.updateIsActiveGroupRestriction(remoteJid, "anti-payment", true);
  });

  beforeEach(() => {
    __clearEnvelopeRegistry();
  });

  it("should read the original author from a quoted payment", () => {
    const quoted = getQuotedPaymentContext(buildQuotedPaymentWebMessage());

    assert.ok(quoted);
    assert.strictEqual(quoted.participant, authorLid);
    assert.strictEqual(quoted.stanzaId, originalStanzaId);
  });

  it("should return null when the quoted message is not a payment", () => {
    const webMessage = {
      message: {
        extendedTextMessage: {
          text: "oi",
          contextInfo: {
            participant: authorLid,
            stanzaId: "x",
            quotedMessage: { conversation: "mensagem normal" },
          },
        },
      },
    };

    assert.strictEqual(getQuotedPaymentContext(webMessage), null);
  });

  it("should ban the original author and delete the hidden payment message", async () => {
    const calls = [];
    recordOriginalPayment();
    const socket = createSocket(calls, [
      { id: quoterLid, admin: null },
      { id: authorLid, admin: null },
    ]);

    await messageHandler(socket, buildQuotedPaymentWebMessage());

    const removes = removeCalls(calls);
    assert.strictEqual(removes.length, 1);
    assert.deepStrictEqual(removes[0], [
      "groupParticipantsUpdate",
      remoteJid,
      [authorLid],
      "remove",
    ]);

    const deletedOriginal = calls.find(
      (call) =>
        call[0] === "sendMessage" &&
        call[2]?.delete?.id === originalStanzaId &&
        call[2]?.delete?.participant === authorLid,
    );
    assert.ok(deletedOriginal, "deve apagar a mensagem original de pagamento");
  });

  it("should NOT ban the original author when they are a group admin", async () => {
    const calls = [];
    recordOriginalPayment();
    const socket = createSocket(calls, [
      { id: quoterLid, admin: null },
      { id: authorLid, admin: "admin" },
    ]);

    await messageHandler(socket, buildQuotedPaymentWebMessage());

    assert.strictEqual(removeCalls(calls).length, 0);
  });

  it("should NOT ban when the original author is not in the group (forged quote)", async () => {
    const calls = [];
    recordOriginalPayment();
    const socket = createSocket(calls, [{ id: quoterLid, admin: null }]);

    await messageHandler(socket, buildQuotedPaymentWebMessage());

    assert.strictEqual(removeCalls(calls).length, 0);
  });

  it("should NOT ban when the quote is not corroborated (bot never saw the original)", async () => {
    const calls = [];
    // Propositalmente NÃO registramos o envelope original.
    const socket = createSocket(calls, [
      { id: quoterLid, admin: null },
      { id: authorLid, admin: null },
    ]);

    await messageHandler(socket, buildQuotedPaymentWebMessage());

    assert.strictEqual(removeCalls(calls).length, 0);
  });

  it("should NOT ban when the quote is contradicted (forged author)", async () => {
    const calls = [];
    // O id original existe, mas foi de OUTRO autor: marcação aponta o autor errado.
    recordOriginalPayment("999999999@lid");
    const socket = createSocket(calls, [
      { id: quoterLid, admin: null },
      { id: authorLid, admin: null },
    ]);

    await messageHandler(socket, buildQuotedPaymentWebMessage());

    assert.strictEqual(removeCalls(calls).length, 0);
  });

  // ── Garantia central: inocentes NUNCA são banidos ──
  // Mensagens normais e figurinhas não podem disparar remoção.

  it("should NEVER remove anyone for a plain text message", async () => {
    const calls = [];
    const webMessage = {
      key: { remoteJid, fromMe: false, id: "text-id", participant: quoterLid },
      message: { conversation: "oi pessoal, tudo certo?" },
    };
    const socket = createSocket(calls, [{ id: quoterLid, admin: null }]);

    await messageHandler(socket, webMessage);

    assert.strictEqual(removeCalls(calls).length, 0);
  });

  it("should NEVER remove anyone for a sticker message", async () => {
    const calls = [];
    const webMessage = {
      key: {
        remoteJid,
        fromMe: false,
        id: "sticker-id",
        participant: quoterLid,
      },
      message: { stickerMessage: { mimetype: "image/webp" } },
    };
    const socket = createSocket(calls, [{ id: quoterLid, admin: null }]);

    await messageHandler(socket, webMessage);

    assert.strictEqual(removeCalls(calls).length, 0);
  });

  it("should NEVER remove anyone when a member quotes a normal message or sticker", async () => {
    const quotingSticker = {
      key: { remoteJid, fromMe: false, id: "reply-id", participant: quoterLid },
      message: {
        extendedTextMessage: {
          text: "que figurinha boa",
          contextInfo: {
            participant: authorLid,
            stanzaId: "STICKER_ID",
            quotedMessage: { stickerMessage: { mimetype: "image/webp" } },
          },
        },
      },
    };

    const calls = [];
    // Mesmo com o id citado registrado (como figurinha legível), nada acontece.
    recordMessageEnvelope(
      {
        key: { remoteJid, id: "STICKER_ID", participant: authorLid },
        message: { stickerMessage: { mimetype: "image/webp" } },
      },
      false,
    );
    const socket = createSocket(calls, [
      { id: quoterLid, admin: null },
      { id: authorLid, admin: null },
    ]);

    await messageHandler(socket, quotingSticker);

    assert.strictEqual(removeCalls(calls).length, 0);
  });
});
