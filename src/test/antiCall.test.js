import assert from "node:assert";
import { describe, it } from "node:test";
import antiCall from "../commands/admin/anti-call.js";
import { BOT_EMOJI } from "../config.js";
import { onCalls } from "../middlewares/onCalls.js";
import * as database from "../utils/database.js";
import { useGroupRestrictionsCleanup } from "./helpers/groupRestrictions.js";

describe("anti-call", () => {
  const commandGroupId = "anti-call-command-test@g.us";
  const handlerGroupId = "anti-call-handler-test@g.us";
  const userLid = "123456789@lid";

  useGroupRestrictionsCleanup(() => {
    database.updateIsActiveGroupRestriction(commandGroupId, "anti-call", false);
    database.updateIsActiveGroupRestriction(handlerGroupId, "anti-call", true);
  });

  it("should activate and deactivate anti-call", async () => {
    const replies = [];
    const sendSuccessReply = async (message) => replies.push(message);

    await antiCall.handle({
      remoteJid: commandGroupId,
      isGroup: true,
      args: ["1"],
      sendSuccessReply,
    });

    assert.strictEqual(
      database.isActiveGroupRestriction(commandGroupId, "anti-call"),
      true,
    );

    await antiCall.handle({
      remoteJid: commandGroupId,
      isGroup: true,
      args: ["0"],
      sendSuccessReply,
    });

    assert.strictEqual(
      database.isActiveGroupRestriction(commandGroupId, "anti-call"),
      false,
    );
    assert.deepStrictEqual(replies, [
      "Anti-call ativado com sucesso!",
      "Anti-call desativado com sucesso!",
    ]);
  });

  it("should remove call author and warn the group", async () => {
    const calls = [];
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

    await onCalls({
      socket,
      calls: [
        {
          chatId: userLid,
          from: userLid,
          id: "call-id",
          status: "offer",
          isGroup: true,
          groupJid: handlerGroupId,
        },
      ],
    });

    assert.deepStrictEqual(calls, [
      ["groupParticipantsUpdate", handlerGroupId, [userLid], "remove"],
      [
        "sendMessage",
        handlerGroupId,
        { text: `${BOT_EMOJI} 📵 Ligações são proibidas neste grupo!` },
      ],
    ]);
  });

  it("should ignore non-offer call updates", async () => {
    const calls = [];
    const socket = {
      groupMetadata: async () => {
        throw new Error("Should not load metadata");
      },
      groupParticipantsUpdate: async (...args) => {
        calls.push(["groupParticipantsUpdate", ...args]);
      },
      sendMessage: async (...args) => {
        calls.push(["sendMessage", ...args]);
      },
    };

    await onCalls({
      socket,
      calls: [
        {
          from: userLid,
          id: "call-id",
          status: "timeout",
          isGroup: true,
          groupJid: handlerGroupId,
        },
      ],
    });

    assert.deepStrictEqual(calls, []);
  });
});
