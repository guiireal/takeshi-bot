import assert from "node:assert";
import { mkdir, readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import { proto } from "zapo-js";
import { TEMP_DIR } from "../config.js";
import { createSocketAdapter } from "../services/wa.js";
import { loadCommonFunctions } from "../utils/loadCommonFunctions.js";

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
  it("envia a mensagem-pai e associa as cinco imagens do álbum", async () => {
    const { client, calls } = createClientSpy();
    const socket = createSocketAdapter(client);
    const jid = "123@g.us";
    const image = Buffer.from("sample");
    const { sendAlbumFromBuffer } = loadCommonFunctions({
      socket,
      webMessage: {
        key: { remoteJid: jid },
        message: { conversation: "/pin gatos" },
      },
    });
    await sendAlbumFromBuffer(Array(5).fill(image), "Resultados do Pinterest");

    assert.strictEqual(calls.length, 6);
    assert.strictEqual(calls[0][1].albumMessage.expectedImageCount, 5);
    assert.strictEqual(calls[0][2].additionalAttributes, undefined);
    for (const [index, [destination, content]] of calls.slice(1).entries()) {
      assert.strictEqual(destination, jid);
      assert.strictEqual(content.type, "image");
      assert.strictEqual(content.media, image);
      assert.strictEqual(
        content.caption.endsWith("Resultados do Pinterest"),
        index === 0,
      );
      assert.deepStrictEqual(content.messageContextInfo.messageAssociation, {
        associationType: proto.MessageAssociation.AssociationType.MEDIA_ALBUM,
        parentMessageKey: { remoteJid: jid, fromMe: true, id: "message-id" },
      });
    }
  });

  it("sends the original MP4 dimensions for GIF playback", async () => {
    await mkdir(TEMP_DIR, { recursive: true });

    const { client, calls } = createClientSpy();
    const socket = createSocketAdapter(client);
    const video = await readFile(
      new URL("../../assets/samples/sample-video.mp4", import.meta.url),
    );

    await socket.sendMessage("5511999999999@s.whatsapp.net", {
      video,
      mimetype: "video/mp4",
      gifPlayback: true,
    });

    assert.strictEqual(calls[0][1].width, 640);
    assert.strictEqual(calls[0][1].height, 360);
  });

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
