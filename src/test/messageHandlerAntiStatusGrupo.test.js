import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { messageHandler } from "../middlewares/messageHandler.js";
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

describe("messageHandler anti-status-grupo", () => {
  const remoteJid = "anti-status-handler-test@g.us";
  const userLid = "123456789@lid";
  let groupRestrictionsBackup;

  before(() => {
    if (fs.existsSync(groupRestrictionsPath)) {
      groupRestrictionsBackup = fs.readFileSync(groupRestrictionsPath, "utf8");
    }

    database.updateIsActiveGroupRestriction(
      remoteJid,
      "anti-status-grupo",
      true,
    );
  });

  after(() => {
    cleanupGroupRestrictions(groupRestrictionsBackup);
  });

  it("should remove sender and delete group status mention message", async () => {
    const calls = [];
    const webMessage = {
      key: {
        remoteJid,
        fromMe: false,
        id: "message-id",
        participant: userLid,
      },
      message: {
        groupStatusMessage: {
          message: {
            conversation: "status",
          },
        },
      },
    };
    const socket = {
      groupMetadata: async () => ({
        owner: "owner@lid",
        participants: [{ id: userLid, admin: null }],
      }),
      groupParticipantsUpdate: async (...args) => {
        calls.push(["groupParticipantsUpdate", ...args]);
      },
      sendMessage: async (...args) => {
        calls.push(["sendMessage", ...args]);
      },
    };

    await messageHandler(socket, webMessage);

    assert.deepStrictEqual(calls, [
      ["groupParticipantsUpdate", remoteJid, [userLid], "remove"],
      ["sendMessage", remoteJid, { delete: webMessage.key }],
    ]);
  });
});
