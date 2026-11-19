import assert from "node:assert";
import { describe, it } from "node:test";
import {
  hasGroupStatusMessage,
  toGroupStatusEvent,
} from "../utils/groupStatusMessage.js";

describe("Group Status Message Detection", () => {
  it("should detect groupStatusMentionMessage", () => {
    const webMessage = {
      message: {
        groupStatusMentionMessage: {
          message: {
            conversation: "status de grupo",
          },
        },
      },
    };

    assert.strictEqual(hasGroupStatusMessage(webMessage), true);
  });

  it("should detect groupStatusMessage", () => {
    const webMessage = {
      message: {
        groupStatusMessage: {
          message: {
            conversation: "status de grupo",
          },
        },
      },
    };

    assert.strictEqual(hasGroupStatusMessage(webMessage), true);
  });

  it("should detect groupStatusMessageV2", () => {
    const webMessage = {
      message: {
        groupStatusMessageV2: {
          message: {
            conversation: "status de grupo",
          },
        },
      },
    };

    assert.strictEqual(hasGroupStatusMessage(webMessage), true);
  });

  it("should detect contextInfo.isGroupStatus in wrapped media", () => {
    const webMessage = {
      message: {
        ephemeralMessage: {
          message: {
            imageMessage: {
              contextInfo: {
                isGroupStatus: 1,
              },
            },
          },
        },
      },
    };

    assert.strictEqual(hasGroupStatusMessage(webMessage), true);
  });

  it("should detect group status attribution", () => {
    const webMessage = {
      message: {
        extendedTextMessage: {
          text: "status",
          contextInfo: {
            statusAttributions: [
              {
                groupStatus: {
                  authorJid: "123456789@lid",
                },
              },
            ],
          },
        },
      },
    };

    assert.strictEqual(hasGroupStatusMessage(webMessage), true);
  });

  it("should ignore group status flags inside quotedMessage", () => {
    const webMessage = {
      message: {
        extendedTextMessage: {
          text: "resposta normal",
          contextInfo: {
            quotedMessage: {
              imageMessage: {
                contextInfo: {
                  isGroupStatus: true,
                },
              },
            },
          },
        },
      },
    };

    assert.strictEqual(hasGroupStatusMessage(webMessage), false);
  });

  it("should not treat statusMentionMessage alone as group status", () => {
    const webMessage = {
      message: {
        statusMentionMessage: {
          message: {
            conversation: "status comum",
          },
        },
      },
    };

    assert.strictEqual(hasGroupStatusMessage(webMessage), false);
  });

  it("should not loop on cyclic objects or scan binary payloads", () => {
    const message = {
      extendedTextMessage: {
        text: "mensagem normal",
      },
      binary: Buffer.from("status"),
    };

    message.self = message;

    assert.strictEqual(hasGroupStatusMessage({ message }), false);
  });
});

// Formato real do stanza <status> recebido em 18/11/2026 (JIDs trocados).
function statusStanzaEvent(overrides = {}, reason = "unhandled.status") {
  return {
    reason,
    rawNode: {
      tag: "status",
      attrs: {
        from: "120363000000000000@g.us",
        type: "media",
        id: "ACA9292EF1014E5B4A508703DD49A202",
        participant: "111111111111111@lid",
        participant_pn: "5511900000000@s.whatsapp.net",
        t: "1795050273",
        notify: "Fulano",
        ...overrides,
      },
    },
  };
}

describe("Group status stanza (<status>)", () => {
  it("should convert a group <status> stanza into a group status event", () => {
    const event = toGroupStatusEvent(statusStanzaEvent());

    assert.deepStrictEqual(event.key, {
      remoteJid: "120363000000000000@g.us",
      id: "ACA9292EF1014E5B4A508703DD49A202",
      fromMe: false,
      participant: "111111111111111@lid",
      participantAlt: "5511900000000@s.whatsapp.net",
    });
    assert.strictEqual(event.timestampSeconds, 1795050273);
    assert.strictEqual(hasGroupStatusMessage(event), true);
  });

  it("should ignore other unhandled stanzas and non-group status", () => {
    assert.strictEqual(
      toGroupStatusEvent(statusStanzaEvent({}, "unhandled.message")),
      null,
    );
    assert.strictEqual(
      toGroupStatusEvent(statusStanzaEvent({ from: "status@broadcast" })),
      null,
    );
    assert.strictEqual(
      toGroupStatusEvent(statusStanzaEvent({ participant: "" })),
      null,
    );
  });

  it("should not treat status edit or deletion as a new status", () => {
    for (const edit of ["1", "7", "8"]) {
      assert.strictEqual(toGroupStatusEvent(statusStanzaEvent({ edit })), null);
    }
  });
});
