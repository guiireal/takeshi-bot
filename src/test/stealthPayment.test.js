import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { BOT_LID } from "../config.js";
import * as database from "../utils/database.js";
import { handleStealthPaymentDetection } from "../utils/stealthPayment.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const groupRestrictionsPath = path.resolve(
  __dirname,
  "..",
  "..",
  "database",
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

const CIPHERTEXT_STUB = 2;

function createSocket(calls, { admin = null, senderId = "any@lid" } = {}) {
  return {
    groupMetadata: async () => ({
      owner: "owner@lid",
      participants: [{ id: senderId, admin }],
    }),
    sendMessage: async (...args) => {
      calls.push(["sendMessage", ...args]);
    },
    groupParticipantsUpdate: async (...args) => {
      calls.push(["groupParticipantsUpdate", ...args]);
    },
    groupSettingUpdate: async (...args) => {
      calls.push(["groupSettingUpdate", ...args]);
    },
    relayMessage: async (...args) => {
      calls.push(["relayMessage", ...args]);
    },
  };
}

function ciphertextStub(remoteJid, sender, stealthMeta) {
  return {
    key: {
      remoteJid,
      fromMe: false,
      id: `stub-${Math.random()}`,
      participant: sender,
    },
    messageStubType: CIPHERTEXT_STUB,
    messageStubParameters: ["No SenderKeyRecord found for decryption"],
    ...(stealthMeta ? { stealthMeta } : {}),
  };
}

describe("stealth-payment detector", () => {
  const onGroup = "stealth-on@g.us";
  const offGroup = "stealth-off@g.us";
  let groupRestrictionsBackup;

  before(() => {
    if (fs.existsSync(groupRestrictionsPath)) {
      groupRestrictionsBackup = fs.readFileSync(groupRestrictionsPath, "utf8");
    }
    database.updateIsActiveGroupRestriction(onGroup, "anti-payment", true);
    database.updateIsActiveGroupRestriction(offGroup, "anti-payment", false);
  });

  after(() => {
    cleanupGroupRestrictions(groupRestrictionsBackup);
  });

  it("bans the sender on high-confidence decrypt-fail=hide", async () => {
    const calls = [];
    const webMessage = ciphertextStub(onGroup, "hide-attacker@lid", {
      decryptFail: "hide",
      encType: "skmsg",
      failedToDecrypt: true,
    });

    await handleStealthPaymentDetection({
      socket: createSocket(calls, { senderId: "hide-attacker@lid" }),
      webMessage,
    });

    const kicks = calls.filter(
      (c) => c[0] === "groupParticipantsUpdate" && c[3] === "remove",
    );
    assert.strictEqual(kicks.length, 1, "should remove the sender once");
    assert.deepStrictEqual(kicks[0][2], ["hide-attacker@lid"]);
    assert.ok(
      calls.some(
        (c) => c[0] === "groupSettingUpdate" && c[2] === "announcement",
      ),
    );
    assert.ok(
      calls.some(
        (c) => c[0] === "groupSettingUpdate" && c[2] === "not_announcement",
      ),
    );
    const notice = calls.filter((c) => c[0] === "sendMessage").at(-1);
    assert.ok(notice[2].text.includes("Removi"));
    assert.deepStrictEqual(notice[2].mentions, ["hide-attacker@lid"]);
  });

  it("does not alert when anti-payment is off for the group", async () => {
    const calls = [];
    const webMessage = ciphertextStub(offGroup, "hide-attacker2@lid", {
      decryptFail: "hide",
      encType: "skmsg",
      failedToDecrypt: true,
    });

    await handleStealthPaymentDetection({
      socket: createSocket(calls),
      webMessage,
    });

    assert.strictEqual(calls.length, 0);
  });

  it("does not alert when the sender is the bot itself", async () => {
    const calls = [];
    const webMessage = ciphertextStub(onGroup, BOT_LID, {
      decryptFail: "hide",
      encType: "skmsg",
      failedToDecrypt: true,
    });

    await handleStealthPaymentDetection({
      socket: createSocket(calls),
      webMessage,
    });

    assert.strictEqual(calls.length, 0);
  });

  it("does not alert when the sender is a group admin", async () => {
    const calls = [];
    const webMessage = ciphertextStub(onGroup, "admin-sender@lid", {
      decryptFail: "hide",
      encType: "skmsg",
      failedToDecrypt: true,
    });

    await handleStealthPaymentDetection({
      socket: createSocket(calls, {
        admin: "admin",
        senderId: "admin-sender@lid",
      }),
      webMessage,
    });

    assert.strictEqual(calls.length, 0);
  });

  it("ignores repeated plain CIPHERTEXT failures", async () => {
    const sender = "repeat-attacker@lid";
    const socketFactory = (calls) => createSocket(calls, { senderId: sender });

    const calls1 = [];
    await handleStealthPaymentDetection({
      socket: socketFactory(calls1),
      webMessage: ciphertextStub(onGroup, sender),
    });
    assert.strictEqual(calls1.length, 0);

    const calls2 = [];
    await handleStealthPaymentDetection({
      socket: socketFactory(calls2),
      webMessage: ciphertextStub(onGroup, sender),
    });
    assert.strictEqual(calls2.length, 0);

    const calls3 = [];
    await handleStealthPaymentDetection({
      socket: socketFactory(calls3),
      webMessage: ciphertextStub(onGroup, sender),
    });
    assert.strictEqual(calls3.length, 0);
  });

  it("ignores normal messages and non-group chats", async () => {
    const calls = [];
    await handleStealthPaymentDetection({
      socket: createSocket(calls),
      webMessage: {
        key: { remoteJid: onGroup, fromMe: false, participant: "x@lid" },
        message: { conversation: "oi" },
      },
    });
    await handleStealthPaymentDetection({
      socket: createSocket(calls),
      webMessage: ciphertextStub("5511999@s.whatsapp.net", "x@lid", {
        decryptFail: "hide",
      }),
    });

    assert.strictEqual(calls.length, 0);
  });
});
