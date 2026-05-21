import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import antiPayment from "../commands/admin/anti-payment.js";
import { messageHandler } from "../middlewares/messageHandler.js";
import { buildCleanChatMessage } from "../utils/cleanChat.js";
import * as database from "../utils/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testDatabasePath = path.resolve(__dirname, "..", "..", "database");
const groupRestrictionsPath = path.resolve(
  testDatabasePath,
  "group-restrictions.json",
);

function cleanupGroupRestrictions(backup) {
  if (backup !== undefined) {
    fs.writeFileSync(groupRestrictionsPath, backup);
    return;
  }

  if (fs.existsSync(groupRestrictionsPath)) {
    fs.unlinkSync(groupRestrictionsPath);
  }
}

function createSocket(calls, userLid) {
  return {
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
    },
    relayMessage: async (...args) => {
      calls.push(["relayMessage", ...args]);
    },
  };
}

describe("anti-payment", () => {
  const commandGroupId = "anti-payment-command-test@g.us";
  const handlerGroupId = "anti-payment-handler-test@g.us";
  const handlerStatusGroupId = "anti-payment-status-handler-test@g.us";
  const userLid = "123456789@lid";
  let groupRestrictionsBackup;

  before(() => {
    if (fs.existsSync(groupRestrictionsPath)) {
      groupRestrictionsBackup = fs.readFileSync(groupRestrictionsPath, "utf8");
    }

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

  after(() => {
    cleanupGroupRestrictions(groupRestrictionsBackup);
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
    assert.deepStrictEqual(replies, [
      "Anti-payment ativado com sucesso!",
      "Anti-payment desativado com sucesso!",
    ]);
  });

  it("should close group, ban sender and clean chat when direct payment message is detected", async () => {
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

    assert.strictEqual(calls.length, 5);
    assert.deepStrictEqual(calls[0], [
      "groupSettingUpdate",
      handlerGroupId,
      "announcement",
    ]);
    assert.deepStrictEqual(calls[1], [
      "groupParticipantsUpdate",
      handlerGroupId,
      [userLid],
      "remove",
    ]);
    assert.strictEqual(calls[2][0], "sendMessage");
    assert.strictEqual(calls[2][1], handlerGroupId);
    assert.ok(calls[2][2].text.includes("🗑️"));
    assert.deepStrictEqual(calls[3], [
      "relayMessage",
      handlerGroupId,
      buildCleanChatMessage(),
      {},
    ]);
    assert.deepStrictEqual(calls[4], [
      "groupSettingUpdate",
      handlerGroupId,
      "not_announcement",
    ]);
  });

  it("should close group, ban sender and clean chat when payment message is wrapped in group status message", async () => {
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

    assert.strictEqual(calls.length, 5);
    assert.deepStrictEqual(calls[0], [
      "groupSettingUpdate",
      handlerGroupId,
      "announcement",
    ]);
    assert.deepStrictEqual(calls[1], [
      "groupParticipantsUpdate",
      handlerGroupId,
      [userLid],
      "remove",
    ]);
    assert.strictEqual(calls[2][0], "sendMessage");
    assert.strictEqual(calls[2][1], handlerGroupId);
    assert.ok(calls[2][2].text.includes("🗑️"));
    assert.deepStrictEqual(calls[3], [
      "relayMessage",
      handlerGroupId,
      buildCleanChatMessage(),
      {},
    ]);
    assert.deepStrictEqual(calls[4], [
      "groupSettingUpdate",
      handlerGroupId,
      "not_announcement",
    ]);
  });

  it("should close group, ban sender and clean chat when payment and group status restrictions both match", async () => {
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

    assert.strictEqual(calls.length, 5);
    assert.deepStrictEqual(calls[0], [
      "groupSettingUpdate",
      handlerStatusGroupId,
      "announcement",
    ]);
    assert.deepStrictEqual(calls[1], [
      "groupParticipantsUpdate",
      handlerStatusGroupId,
      [userLid],
      "remove",
    ]);
    assert.strictEqual(calls[2][0], "sendMessage");
    assert.strictEqual(calls[2][1], handlerStatusGroupId);
    assert.ok(calls[2][2].text.includes("🗑️"));
    assert.deepStrictEqual(calls[3], [
      "relayMessage",
      handlerStatusGroupId,
      buildCleanChatMessage(),
      {},
    ]);
    assert.deepStrictEqual(calls[4], [
      "groupSettingUpdate",
      handlerStatusGroupId,
      "not_announcement",
    ]);
  });
});
