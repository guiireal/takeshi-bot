import assert from "node:assert";
import { beforeEach, describe, it } from "node:test";
import antiPayment from "../commands/admin/anti-payment.js";
import { messageHandler } from "../middlewares/messageHandler.js";
import { useGroupRestrictionsCleanup } from "./helpers/groupRestrictions.js";
import { buildCleanChatMessage } from "../utils/cleanChat.js";
import {
  __clearPaymentDefenseState,
  __setGroupIncidentTtlForTests,
} from "../utils/paymentDefenseState.js";
import * as database from "../utils/database.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function createSocket(calls, userLid) {
  let messageSeq = 0;

  return {
    user: { id: "bot-user@s.whatsapp.net" },
    groupMetadata: async () => ({
      owner: "owner@lid",
      participants: [{ id: userLid, admin: null }],
    }),
    groupSettingUpdate: async (...args) => {
      calls.push(["groupSettingUpdate", ...args]);
    },
    groupParticipantsUpdate: async (...args) => {
      calls.push(["groupParticipantsUpdate", ...args]);
    },
    sendMessage: async (...args) => {
      calls.push(["sendMessage", ...args]);
      messageSeq += 1;

      return {
        key: {
          id: `BOT_MSG_${messageSeq}`,
          fromMe: true,
          remoteJid: args[0],
        },
      };
    },
    relayMessage: async (...args) => {
      calls.push(["relayMessage", ...args]);
    },
  };
}

const countSetting = (calls, setting) =>
  calls.filter(
    (call) => call[0] === "groupSettingUpdate" && call[2] === setting,
  ).length;

const findRemove = (calls, lid) =>
  calls.find(
    (call) =>
      call[0] === "groupParticipantsUpdate" &&
      call[3] === "remove" &&
      Array.isArray(call[2]) &&
      call[2][0] === lid,
  );

const findDelete = (calls, id, lid) =>
  calls.find(
    (call) =>
      call[0] === "sendMessage" &&
      call[2]?.delete?.id === id &&
      call[2]?.delete?.participant === lid,
  );

const findCleanText = (calls) =>
  calls.find(
    (call) =>
      call[0] === "sendMessage" &&
      typeof call[2]?.text === "string" &&
      call[2].text.includes("🗑️"),
  );

const findRelay = (calls) =>
  calls.find(
    (call) =>
      call[0] === "relayMessage" &&
      JSON.stringify(call[2]) === JSON.stringify(buildCleanChatMessage()),
  );

// Asserções comuns ao incidente de pagamento: grupo fechado uma vez, autor
// removido, mensagem revogada, chat limpo e grupo reaberto (uma vez, debounced).
async function assertPaymentIncident({ calls, groupId, lid, messageId }) {
  assert.strictEqual(countSetting(calls, "announcement"), 1);
  assert.ok(findRemove(calls, lid), "deve remover o autor");
  assert.ok(findDelete(calls, messageId, lid), "deve apagar a mensagem");
  assert.ok(findCleanText(calls), "deve enviar a limpeza de chat");
  assert.ok(findRelay(calls), "deve relayar a imagem de limpeza");

  // A reabertura é debounced (TTL curto nos testes): espera o timer disparar.
  await sleep(120);
  assert.strictEqual(countSetting(calls, "not_announcement"), 1);
  assert.ok(
    calls.every((call) => call[1] === undefined || call[1] === groupId),
    "todas as ações devem ser no grupo correto",
  );
}

describe("anti-payment", () => {
  const commandGroupId = "anti-payment-command-test@g.us";
  const handlerGroupId = "anti-payment-handler-test@g.us";
  const handlerStatusGroupId = "anti-payment-status-handler-test@g.us";
  const userLid = "123456789@lid";

  useGroupRestrictionsCleanup(() => {
    database.updateIsActiveGroupRestriction(
      commandGroupId,
      "anti-payment",
      false,
    );
    database.updateIsActiveGroupRestriction(
      handlerGroupId,
      "anti-payment",
      true,
    );
    database.updateIsActiveGroupRestriction(
      handlerStatusGroupId,
      "anti-payment",
      true,
    );
    database.updateIsActiveGroupRestriction(
      handlerStatusGroupId,
      "anti-status-grupo",
      true,
    );
  });

  beforeEach(() => {
    __clearPaymentDefenseState();
    __setGroupIncidentTtlForTests(20);
  });

  it("should activate and deactivate anti-payment", async () => {
    const replies = [];
    const sendSuccessReply = async (message) => replies.push(message);

    await antiPayment.handle({
      remoteJid: commandGroupId,
      isGroup: true,
      args: ["1"],
      sendSuccessReply,
    });

    assert.strictEqual(
      database.isActiveGroupRestriction(commandGroupId, "anti-payment"),
      true,
    );

    await antiPayment.handle({
      remoteJid: commandGroupId,
      isGroup: true,
      args: ["0"],
      sendSuccessReply,
    });

    assert.strictEqual(
      database.isActiveGroupRestriction(commandGroupId, "anti-payment"),
      false,
    );
    assert.strictEqual(replies.length, 2);
    assert.ok(replies[0].startsWith("Anti-payment ativado com sucesso!"));
    assert.strictEqual(replies[1], "Anti-payment desativado com sucesso!");
  });

  it("should close group, ban sender, delete message and clean chat when direct payment message is detected", async () => {
    const calls = [];
    const webMessage = {
      key: {
        remoteJid: handlerGroupId,
        fromMe: false,
        id: "payment-message-id",
        participant: userLid,
      },
      message: {
        requestPaymentMessage: {
          currencyCodeIso4217: "BRL",
        },
      },
    };

    await messageHandler(createSocket(calls, userLid), webMessage);

    await assertPaymentIncident({
      calls,
      groupId: handlerGroupId,
      lid: userLid,
      messageId: "payment-message-id",
    });
  });

  it("should close group, ban sender, delete message and clean chat when send payment message is detected", async () => {
    const calls = [];
    const webMessage = {
      key: {
        remoteJid: handlerGroupId,
        fromMe: false,
        id: "send-payment-message-id",
        participant: userLid,
      },
      message: {
        sendPaymentMessage: {
          noteMessage: {
            extendedTextMessage: { text: "pagamento" },
          },
        },
      },
    };

    await messageHandler(createSocket(calls, userLid), webMessage);

    await assertPaymentIncident({
      calls,
      groupId: handlerGroupId,
      lid: userLid,
      messageId: "send-payment-message-id",
    });
  });

  it("should close group, ban sender, delete message and clean chat when payment message is wrapped in group status message", async () => {
    const calls = [];
    const webMessage = {
      key: {
        remoteJid: handlerGroupId,
        fromMe: false,
        id: "wrapped-payment-message-id",
        participant: userLid,
      },
      message: {
        groupStatusMessageV2: {
          message: {
            requestPaymentMessage: {
              currencyCodeIso4217: "BRL",
            },
          },
        },
      },
    };

    await messageHandler(createSocket(calls, userLid), webMessage);

    await assertPaymentIncident({
      calls,
      groupId: handlerGroupId,
      lid: userLid,
      messageId: "wrapped-payment-message-id",
    });
  });

  it("should close group, ban sender, delete message and clean chat when payment and group status restrictions both match", async () => {
    const calls = [];
    const webMessage = {
      key: {
        remoteJid: handlerStatusGroupId,
        fromMe: false,
        id: "status-payment-message-id",
        participant: userLid,
      },
      message: {
        groupStatusMessageV2: {
          message: {
            requestPaymentMessage: {
              currencyCodeIso4217: "BRL",
            },
          },
        },
      },
    };

    await messageHandler(createSocket(calls, userLid), webMessage);

    await assertPaymentIncident({
      calls,
      groupId: handlerStatusGroupId,
      lid: userLid,
      messageId: "status-payment-message-id",
    });
  });

  it("should resolve the author from participantAlt when participant is absent", async () => {
    const calls = [];
    const altLid = "987654321@lid";
    const webMessage = {
      key: {
        remoteJid: handlerGroupId,
        fromMe: false,
        id: "alt-payment-message-id",
        participantAlt: altLid,
      },
      message: {
        requestPaymentMessage: {
          currencyCodeIso4217: "BRL",
        },
      },
    };

    await messageHandler(createSocket(calls, altLid), webMessage);

    assert.ok(findRemove(calls, altLid), "deve remover o autor via participantAlt");
    assert.ok(
      findDelete(calls, "alt-payment-message-id", altLid),
      "deve apagar a mensagem do autor via participantAlt",
    );
  });
});
