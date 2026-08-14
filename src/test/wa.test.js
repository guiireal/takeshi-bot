import assert from "node:assert";
import { describe, it } from "node:test";
import { createSocketAdapter } from "../services/wa.js";

function createClientSpy() {
  const calls = [];
  const client = {
    message: {
      async send(...args) {
        calls.push(args);
        return { id: "message-id", ack: 1 };
      },
    },
  };

  return { client, calls };
}

describe("WhatsApp compatibility adapter", () => {
  it("envia Rich Response com stanza type text", async () => {
    const { client, calls } = createClientSpy();
    const socket = createSocketAdapter(client);
    const message = {
      botForwardedMessage: {
        message: {
          richResponseMessage: {
            messageType: 1,
          },
        },
      },
    };

    await socket.relayMessage("5511999999999@s.whatsapp.net", message);

    assert.strictEqual(calls.length, 1);
    assert.deepStrictEqual(calls[0][2].additionalAttributes, {
      type: "text",
    });
  });

  it("preserva atributos extras ao corrigir o tipo da Rich Response", async () => {
    const { client, calls } = createClientSpy();
    const socket = createSocketAdapter(client);
    const message = {
      botForwardedMessage: {
        message: {
          richResponseMessage: {
            messageType: 1,
          },
        },
      },
    };

    await socket.relayMessage("5511999999999@s.whatsapp.net", message, {
      additionalAttributes: {
        custom: "value",
        type: "media",
      },
    });

    assert.deepStrictEqual(calls[0][2].additionalAttributes, {
      custom: "value",
      type: "text",
    });
  });

  it("não altera o tipo de outros envelopes", async () => {
    const { client, calls } = createClientSpy();
    const socket = createSocketAdapter(client);

    await socket.relayMessage("5511999999999@s.whatsapp.net", {
      conversation: "texto comum",
    });

    assert.strictEqual(calls[0][2].additionalAttributes, undefined);
  });
});
