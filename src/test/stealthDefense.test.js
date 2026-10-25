import assert from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";
import { clearChat } from "../messages.js";
import { handleStealthDefense } from "../utils/antiStealthAction.js";
import * as database from "../utils/database.js";
import {
  __clearStealthDefenseState,
  __flushGroupReopens,
} from "../utils/stealthDefenseState.js";
import { useGroupRestrictionsCleanup } from "./helpers/groupRestrictions.js";

const groupJid = "stealth-defense-test@g.us";
const author = "111111111@lid";

function buildDetection(messageId, overrides = {}) {
  return {
    groupJid,
    author,
    authorIds: [author],
    messageId,
    hiddenAttribute: false,
    ciphertextBytes: null,
    encryptionType: "skmsg",
    failureReason: "message.decrypt_failed.skmsg",
    ...overrides,
  };
}

function buildSocket({ admin = null } = {}) {
  const settings = [];
  const removals = [];
  const revokes = [];
  const texts = [];

  const socket = {
    user: { id: "bot@lid" },
    groupMetadata: async () => ({
      id: groupJid,
      owner: "owner@lid",
      announce: settings.at(-1) === "announcement",
      participants: [{ id: author, jid: author, admin }],
    }),
    groupSettingUpdate: async (_jid, setting) => {
      settings.push(setting);
    },
    groupParticipantsUpdate: async (_jid, participants, action) => {
      removals.push([action, ...participants]);
      return [];
    },
    sendMessage: async (_jid, content) => {
      if (content?.delete) {
        revokes.push(content.delete.id);
      }
      if (content?.text) {
        texts.push(content.text);
      }
      return { key: { id: "sent" } };
    },
  };

  return { socket, settings, removals, revokes, texts };
}

const closes = (settings) =>
  settings.filter((setting) => setting === "announcement").length;
const reopens = (settings) =>
  settings.filter((setting) => setting === "not_announcement").length;

describe("anti-stealth defense", () => {
  useGroupRestrictionsCleanup(() => {
    database.updateIsActiveGroupRestriction(groupJid, "anti-stealth", true);
  });

  beforeEach(() => {
    __clearStealthDefenseState();
  });

  afterEach(() => {
    __clearStealthDefenseState();
  });

  it("should preserve the author while the failures are isolated", async () => {
    const { socket, settings, removals } = buildSocket();

    await handleStealthDefense({ socket, detection: buildDetection("s1") });
    await handleStealthDefense({ socket, detection: buildDetection("s2") });

    assert.deepStrictEqual(removals, []);
    assert.strictEqual(closes(settings), 0);
  });

  it("should close, remove, revoke and reopen once the burst is confirmed", async () => {
    const { socket, settings, removals, revokes, texts } = buildSocket();

    for (const id of ["s1", "s2", "s3"]) {
      await handleStealthDefense({ socket, detection: buildDetection(id) });
    }

    assert.deepStrictEqual(removals, [["remove", author]]);
    assert.strictEqual(closes(settings), 1);
    assert.deepStrictEqual(revokes, ["s1", "s2", "s3"]);
    assert.deepStrictEqual(texts, [`\n\n${clearChat()}`]);
    assert.strictEqual(reopens(settings), 0);

    await __flushGroupReopens();

    assert.strictEqual(reopens(settings), 1);
  });

  it("should not count redelivered ids twice", async () => {
    const { socket, removals } = buildSocket();

    for (const id of ["s1", "s1", "s1", "s1"]) {
      await handleStealthDefense({ socket, detection: buildDetection(id) });
    }

    assert.deepStrictEqual(removals, []);
  });

  it("should not count the reaction/pin class", async () => {
    const { socket, removals } = buildSocket();

    for (const id of ["s1", "s2", "s3"]) {
      await handleStealthDefense({
        socket,
        detection: buildDetection(id, { hiddenAttribute: true }),
      });
    }

    assert.deepStrictEqual(removals, []);
  });

  it("should only revoke, never re-remove, an author already contained", async () => {
    const { socket, removals, revokes } = buildSocket();

    for (const id of ["s1", "s2", "s3", "s4", "s5"]) {
      await handleStealthDefense({ socket, detection: buildDetection(id) });
    }

    assert.deepStrictEqual(removals, [["remove", author]]);
    assert.deepStrictEqual(revokes, ["s1", "s2", "s3", "s4", "s5"]);
  });

  it("should preserve group admins", async () => {
    const { socket, settings, removals } = buildSocket({ admin: "admin" });

    for (const id of ["s1", "s2", "s3"]) {
      await handleStealthDefense({ socket, detection: buildDetection(id) });
    }

    assert.deepStrictEqual(removals, []);
    assert.strictEqual(closes(settings), 0);
  });

  it("should do nothing when the group has anti-stealth off", async () => {
    database.updateIsActiveGroupRestriction(groupJid, "anti-stealth", false);

    const { socket, settings, removals } = buildSocket();

    for (const id of ["s1", "s2", "s3"]) {
      await handleStealthDefense({ socket, detection: buildDetection(id) });
    }

    assert.deepStrictEqual(removals, []);
    assert.strictEqual(closes(settings), 0);
  });

  it("should never punish the bot itself", async () => {
    const { socket, removals } = buildSocket();

    for (const id of ["s1", "s2", "s3"]) {
      await handleStealthDefense({
        socket,
        detection: buildDetection(id, {
          author: "bot@lid",
          authorIds: ["bot@lid"],
        }),
      });
    }

    assert.deepStrictEqual(removals, []);
  });
});
