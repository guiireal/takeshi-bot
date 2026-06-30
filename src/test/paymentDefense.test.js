import assert from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  __clearPaymentDefenseState,
  __setGroupIncidentTtlForTests,
  defendAgainstPayment,
} from "../utils/paymentDefenseState.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const remoteJid = "payment-defense-test@g.us";

function buildSocket() {
  const settings = [];
  const removals = [];
  const revokes = [];

  const socket = {
    groupSettingUpdate: async (_jid, setting) => {
      settings.push(setting);
    },
    groupParticipantsUpdate: async (_jid, participants, action) => {
      removals.push([action, ...participants]);
      return [];
    },
    sendMessage: async (_jid, content) => {
      if (content?.delete) {
        revokes.push(content.delete);
      }
      return {};
    },
    relayMessage: async () => ({}),
  };

  return { socket, settings, removals, revokes };
}

const announcements = (settings) =>
  settings.filter((setting) => setting === "announcement").length;
const reopens = (settings) =>
  settings.filter((setting) => setting === "not_announcement").length;

function messageKey(id, participant) {
  return { remoteJid, fromMe: false, id, participant };
}

describe("payment defense", () => {
  beforeEach(() => {
    __clearPaymentDefenseState();
  });

  afterEach(() => {
    __clearPaymentDefenseState();
  });

  it("collapses many concurrent messages from the same author into one defense", async () => {
    const { socket, settings, removals, revokes } = buildSocket();
    const userLid = "111111111@lid";

    const results = await Promise.all(
      Array.from({ length: 30 }, (_, index) =>
        defendAgainstPayment({
          socket,
          remoteJid,
          userLid,
          messageKey: messageKey(`m${index}`, userLid),
        }),
      ),
    );

    assert.ok(results.every(Boolean));
    assert.strictEqual(removals.length, 1);
    assert.deepStrictEqual(removals[0], ["remove", userLid]);
    assert.strictEqual(announcements(settings), 1);
    assert.strictEqual(revokes.length, 1);
  });

  it("shares one group close across different authors but removes each", async () => {
    const { socket, settings, removals, revokes } = buildSocket();

    const results = await Promise.all(
      Array.from({ length: 10 }, (_, index) => {
        const userLid = `attacker-${index}@lid`;

        return defendAgainstPayment({
          socket,
          remoteJid,
          userLid,
          messageKey: messageKey(`m${index}`, userLid),
        });
      }),
    );

    assert.ok(results.every(Boolean));
    assert.strictEqual(removals.length, 10);
    assert.strictEqual(revokes.length, 10);
    assert.strictEqual(announcements(settings), 1);
  });

  it("does not suppress later messages when the removal fails", async () => {
    const { socket, settings } = buildSocket();
    const userLid = "222222222@lid";
    let removalAttempts = 0;

    socket.groupParticipantsUpdate = async () => {
      removalAttempts += 1;
      throw new Error("falha temporária na remoção");
    };

    // TTL longo para o incidente persistir entre as duas tentativas.
    __setGroupIncidentTtlForTests(10_000);

    const params = {
      socket,
      remoteJid,
      userLid,
      messageKey: messageKey("m0", userLid),
    };

    assert.strictEqual(await defendAgainstPayment(params), false);
    assert.strictEqual(await defendAgainstPayment(params), false);
    assert.strictEqual(removalAttempts, 2);
    assert.strictEqual(announcements(settings), 1);
  });

  it("reopens the group exactly once after the burst settles", async () => {
    const { socket, settings } = buildSocket();
    __setGroupIncidentTtlForTests(20);

    await Promise.all(
      Array.from({ length: 5 }, (_, index) => {
        const userLid = `burst-${index}@lid`;

        return defendAgainstPayment({
          socket,
          remoteJid,
          userLid,
          messageKey: messageKey(`m${index}`, userLid),
        });
      }),
    );

    assert.strictEqual(announcements(settings), 1);
    assert.strictEqual(reopens(settings), 0);

    await sleep(120);

    assert.strictEqual(reopens(settings), 1);
  });

  it("ignores calls without group or author", async () => {
    const { socket, settings, removals } = buildSocket();

    assert.strictEqual(
      await defendAgainstPayment({ socket, remoteJid: "", userLid: "x@lid" }),
      false,
    );
    assert.strictEqual(
      await defendAgainstPayment({ socket, remoteJid, userLid: null }),
      false,
    );
    assert.deepStrictEqual(removals, []);
    assert.deepStrictEqual(settings, []);
  });
});
