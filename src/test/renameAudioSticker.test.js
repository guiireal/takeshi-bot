import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, beforeEach, mock, test } from "node:test";
import { promisify } from "node:util";
import { proto } from "zapo-js";
import command from "../commands/member/rename.js";
import { createSocketAdapter } from "../services/wa.js";
import {
  getAudioStickerAudio,
  getQuotedAudioSticker,
  rememberAudioSticker,
} from "../utils/audioSticker.js";
import { __clearViewOnceCache } from "../utils/viewOnceCache.js";

const runFile = promisify(execFile);
const chatJid = "rename-audio@g.us";
const sticker = { mimetype: "image/webp", directPath: "/sticker", mediaKey: new Uint8Array(32) };
const voice = { ptt: true, directPath: "/voice", mediaKey: new Uint8Array(32) };
const roundTrip = (message) => proto.Message.decode(proto.Message.encode(message).finish());
const quote = (stanzaId) => ({
  extendedTextMessage: { contextInfo: { stanzaId, quotedMessage: { stickerMessage: sticker } } },
});
let directory;
let sequence = 0;

function fakeClient() {
  const sent = [];
  return {
    sent,
    client: {
      message: {
        upload: async (_source, { mimetype }) => ({ directPath: "/uploaded", mimetype, mediaKey: new Uint8Array(32) }),
        send: async (_jid, message) => {
          sent.push(message);
          return { id: `SENT_${sent.length}` };
        },
      },
    },
  };
}

// Figurinha com áudio montada pelo próprio sendAudioSticker, como chega pelo WhatsApp.
async function audioStickerMessage() {
  const { client, sent } = fakeClient();
  await createSocketAdapter(client).sendAudioSticker(chatJid, sticker, voice);
  return roundTrip(sent[0]);
}

before(async () => {
  directory = await mkdtemp(path.join(tmpdir(), "takeshi-rename-audio-"));
  await runFile("ffmpeg", [
    "-f", "lavfi", "-i", "color=blue:size=64x64", "-frames:v", "1",
    path.join(directory, "sticker.webp"),
  ], { windowsHide: true });
});

beforeEach(() => __clearViewOnceCache());

after(async () => {
  if (directory) await rm(directory, { recursive: true, force: true });
});

test("lê o áudio da figurinha direto ou só pelo wrapper 134", async () => {
  const message = await audioStickerMessage();
  for (const candidate of [message, roundTrip({ stickerMessage: sticker, $unknowns: message.$unknowns })]) {
    assert.equal(getAudioStickerAudio(candidate)?.directPath, "/voice");
  }
  assert.equal(getAudioStickerAudio(roundTrip({ stickerMessage: sticker })), undefined);
  assert.equal(getAudioStickerAudio(undefined), undefined);
});

test("acha o áudio pelo id quando a citação vem sem ele, só no mesmo chat", async () => {
  rememberAudioSticker(chatJid, "ORIGINAL", await audioStickerMessage());
  rememberAudioSticker(chatJid, "PLAIN", { stickerMessage: sticker });

  assert.equal(getQuotedAudioSticker({ message: quote("ORIGINAL") }, chatJid)?.directPath, "/voice");
  assert.equal(getQuotedAudioSticker({ message: quote("ORIGINAL") }, "outro@g.us"), undefined);
  assert.equal(getQuotedAudioSticker({ message: quote("PLAIN") }, chatJid), undefined);
});

test("guarda o áudio da figurinha que o próprio bot envia", async () => {
  const { client } = fakeClient();
  const sent = await createSocketAdapter(client).sendAudioSticker(chatJid, sticker, voice);

  assert.equal(getQuotedAudioSticker({ message: quote(sent.key.id) }, chatJid)?.directPath, "/voice");
});

for (const withAudio of [true, false]) {
  test(`rename ${withAudio ? "mantém o áudio" : "segue mudo"} na figurinha ${withAudio ? "com" : "sem"} áudio`, async () => {
    if (withAudio) rememberAudioSticker(chatJid, "STICKER", await audioStickerMessage());
    const inputPath = path.join(directory, `input-${sequence++}.webp`);
    const props = {
      isSticker: true,
      args: ["pacote", "autor"],
      remoteJid: chatJid,
      webMessage: { message: quote("STICKER"), pushName: "Teste" },
      socket: { sendAudioSticker: mock.fn(async () => {}) },
      sendWaitReact: mock.fn(async () => {}),
      sendSuccessReact: mock.fn(async () => {}),
      sendStickerFromFile: mock.fn(async () => {}),
      downloadSticker: mock.fn(async () => {
        await runFile("ffmpeg", ["-y", "-i", path.join(directory, "sticker.webp"), inputPath], { windowsHide: true });
        return inputPath;
      }),
    };

    await command.handle(props);

    assert.equal(props.socket.sendAudioSticker.mock.callCount(), withAudio ? 1 : 0);
    assert.equal(props.sendStickerFromFile.mock.callCount(), withAudio ? 0 : 1);
    if (withAudio) {
      const [jid, stickerPath, audio] = props.socket.sendAudioSticker.mock.calls[0].arguments;
      assert.equal(jid, chatJid);
      assert.ok(stickerPath.endsWith(".webp"));
      assert.equal(audio.directPath, "/voice");
    }
    assert.equal(existsSync(inputPath), false);
  });
}
