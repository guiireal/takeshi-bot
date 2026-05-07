import assert from "node:assert";
import { describe, it } from "node:test";
import { hasGroupStatusMessage } from "../utils/groupStatusMessage.js";

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
