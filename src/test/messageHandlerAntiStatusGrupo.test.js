import assert from "node:assert";
import { describe, it } from "node:test";
import { messageHandler } from "../middlewares/messageHandler.js";
import { useGroupRestrictionsCleanup } from "./helpers/groupRestrictions.js";
import * as database from "../utils/database.js";

describe("messageHandler anti-status-grupo", () => {
  const remoteJid = "anti-status-handler-test@g.us";
  const userLid = "123456789@lid";

  useGroupRestrictionsCleanup(() => {
    database.updateIsActiveGroupRestriction(
      remoteJid,
      "anti-status-grupo",
      true,
    );
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
