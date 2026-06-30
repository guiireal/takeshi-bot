import assert from "node:assert";
import { beforeEach, describe, it } from "node:test";
import {
  __clearEnvelopeRegistry,
  recordMessageEnvelope,
  verifyQuotedAuthor,
} from "../utils/messageEnvelopeRegistry.js";

const groupJid = "envelope-registry-test@g.us";
const stanzaId = "ORIGINAL_PAYMENT_ID";
const authorLid = "555000111@lid";
const authorAlt = "5511999999999@s.whatsapp.net";

describe("message envelope registry", () => {
  beforeEach(() => {
    __clearEnvelopeRegistry();
  });

  it("corroborates a quote that matches the recorded participant", () => {
    recordMessageEnvelope(
      { key: { remoteJid: groupJid, id: stanzaId, participant: authorLid }, message: null },
      true,
    );

    assert.deepStrictEqual(
      verifyQuotedAuthor({ groupJid, stanzaId, participant: authorLid }),
      { corroborated: true, contradicted: false },
    );
  });

  it("corroborates a quote that matches the recorded participantAlt", () => {
    recordMessageEnvelope(
      {
        key: {
          remoteJid: groupJid,
          id: stanzaId,
          participant: authorLid,
          participantAlt: authorAlt,
        },
        message: null,
      },
      true,
    );

    // A marcação aponta a forma alternativa do autor; ainda assim corrobora.
    assert.deepStrictEqual(
      verifyQuotedAuthor({ groupJid, stanzaId, participant: authorAlt }),
      { corroborated: true, contradicted: false },
    );
  });

  it("flags a forged quote when the author matches neither form", () => {
    recordMessageEnvelope(
      {
        key: {
          remoteJid: groupJid,
          id: stanzaId,
          participant: authorLid,
          participantAlt: authorAlt,
        },
        message: null,
      },
      true,
    );

    assert.deepStrictEqual(
      verifyQuotedAuthor({ groupJid, stanzaId, participant: "999@lid" }),
      { corroborated: false, contradicted: true },
    );
  });
});
