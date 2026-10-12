import assert from "node:assert";
import { describe, it } from "node:test";
import { parseStealthFailure } from "../utils/stealthMessage.js";

const groupJid = "stealth-parse-test@g.us";

function buildEvent(overrides = {}) {
  const { rawNode: rawNodeOverrides, ...eventOverrides } = overrides;

  return {
    reason: "message.decrypt_failed.skmsg",
    chatJid: groupJid,
    stanzaId: "STEALTH1",
    rawNode: {
      tag: "message",
      attrs: {
        from: groupJid,
        id: "STEALTH1",
        participant: "111111111:12@lid",
      },
      content: [{ tag: "enc", attrs: { type: "skmsg", v: "2" } }],
      ...rawNodeOverrides,
    },
    ...eventOverrides,
  };
}

describe("parseStealthFailure", () => {
  it("should detect a group skmsg decryption failure", () => {
    const detection = parseStealthFailure(buildEvent());

    assert.ok(detection);
    assert.strictEqual(detection.groupJid, groupJid);
    assert.strictEqual(detection.author, "111111111@lid");
    assert.strictEqual(detection.messageId, "STEALTH1");
    assert.strictEqual(detection.hiddenAttribute, false);
    assert.strictEqual(detection.encryptionType, "skmsg");
  });

  it("should collect every author id form without duplicates", () => {
    const detection = parseStealthFailure(
      buildEvent({
        rawNode: {
          attrs: {
            from: groupJid,
            id: "STEALTH1",
            participant: "111111111:12@lid",
            participant_lid: "111111111@lid",
            participant_pn: "5511999999999:12@s.whatsapp.net",
          },
          content: [{ tag: "enc", attrs: { type: "skmsg" } }],
        },
      }),
    );

    assert.deepStrictEqual(detection.authorIds, [
      "111111111@lid",
      "5511999999999@s.whatsapp.net",
    ]);
  });

  it("should flag the reaction/pin class as hidden", () => {
    const detection = parseStealthFailure(
      buildEvent({
        rawNode: {
          attrs: {
            from: groupJid,
            id: "STEALTH1",
            participant: "111111111@lid",
          },
          content: [
            { tag: "enc", attrs: { type: "skmsg", "decrypt-fail": "hide" } },
          ],
        },
      }),
    );

    assert.strictEqual(detection.hiddenAttribute, true);
  });

  it("should ignore stanzas with another failure reason", () => {
    assert.strictEqual(
      parseStealthFailure(buildEvent({ reason: "message.unknown" })),
      null,
    );
  });

  it("should ignore failures outside of groups", () => {
    assert.strictEqual(
      parseStealthFailure(
        buildEvent({
          chatJid: "111111111@s.whatsapp.net",
          rawNode: {
            attrs: { from: "111111111@s.whatsapp.net", id: "STEALTH1" },
            content: [{ tag: "enc", attrs: { type: "skmsg" } }],
          },
        }),
      ),
      null,
    );
  });

  it("should ignore failures without a group session (skmsg) payload", () => {
    assert.strictEqual(
      parseStealthFailure(
        buildEvent({
          rawNode: {
            attrs: {
              from: groupJid,
              id: "STEALTH1",
              participant: "111111111@lid",
            },
            content: [{ tag: "enc", attrs: { type: "pkmsg" } }],
          },
        }),
      ),
      null,
    );
  });
});
