import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { copyFile, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, beforeEach, mock, test } from "node:test";
import { promisify } from "node:util";
import webp from "node-webpmux";
import { InvalidParameterError, WarningError } from "../errors/index.js";
import { createSocketAdapter } from "../services/wa.js";

const mediaUrl = "https://media.invalid/audio.mp3";
const play = mock.fn(async () => ({ url: mediaUrl }));
const download = mock.fn(async () => ({ url: mediaUrl }));
mock.module("../services/spider-x-api.js", {
  namedExports: { play, download },
});
const { default: command } = await import("../commands/member/stickeraudio.js");

const runFile = promisify(execFile);
let directory;
let sequence = 0;

before(async () => {
  directory = await mkdtemp(path.join(tmpdir(), "takeshi-stickeraudio-"));
  for (const sound of [true, false]) {
    await runFile("ffmpeg", [
      "-f", "lavfi", "-i", "testsrc2=size=96x64:rate=15:duration=1",
      ...(sound ? ["-f", "lavfi", "-i", "sine=frequency=440:duration=1"] : []),
      "-c:v", "libx264", "-pix_fmt", "yuv420p",
      ...(sound ? ["-c:a", "aac", "-shortest"] : []),
      path.join(directory, `${sound}.mp4`),
    ], { windowsHide: true });
  }
  await runFile("ffmpeg", [
    "-f", "lavfi", "-i", "sine=frequency=440:duration=31",
    path.join(directory, "music.mp3"),
  ], { windowsHide: true });
  await runFile("ffmpeg", [
    "-f", "lavfi", "-i", "color=blue:size=64x64", "-frames:v", "1",
    path.join(directory, "image.png"),
  ], { windowsHide: true });
});

beforeEach(() => {
  play.mock.resetCalls();
  download.mock.resetCalls();
});

after(async () => {
  if (directory) await rm(directory, { recursive: true, force: true });
});

function propsFor(message, sound = true) {
  const videoPath = path.join(directory, `download-${sequence++}.mp4`);
  const props = {
    socket: { sendAudioSticker: mock.fn(async () => {}) },
    remoteJid: "stickeraudio-test@g.us",
    userLid: "123@lid",
    webMessage: { message, pushName: "Test" },
    fullArgs: "",
    sendWaitReact: mock.fn(async () => {}),
    sendSuccessReact: mock.fn(async () => {}),
    downloadVideo: mock.fn(async (message) => {
      assert.equal(message, props.webMessage);
      await copyFile(path.join(directory, `${sound}.mp4`), videoPath);
      return videoPath;
    }),
  };
  return { props, videoPath };
}

for (const quoted of [false, true]) {
  test(`cria figurinha animada com o som do vídeo ${quoted ? "respondido" : "anexado"}`, async () => {
    const video = { seconds: 1 };
    const message = quoted
      ? { extendedTextMessage: { contextInfo: { quotedMessage: { videoMessage: video } } } }
      : { videoMessage: video };
    const { props, videoPath } = propsFor(message);
    let stickerPath;
    props.socket.sendAudioSticker = mock.fn(async (jid, sticker, audio) => {
      stickerPath = sticker;
      assert.equal(jid, props.remoteJid);
      const image = new webp.Image();
      await image.load(sticker);
      assert.ok(image.frames.length > 1);
      assert.ok(image.exif.includes(Buffer.from("Test")));
      const audioPath = path.join(directory, `voice-${quoted}.ogg`);
      await writeFile(audioPath, audio);
      const { stdout } = await runFile("ffprobe", [
        "-v", "error", "-show_streams", "-of", "json", audioPath,
      ], { windowsHide: true });
      const { streams } = JSON.parse(stdout);
      assert.equal(streams.length, 1);
      assert.equal(streams[0].codec_name, "opus");
      assert.ok(Math.abs(Number(streams[0].duration) - 1) < 0.1);
    });

    await command.handle(props);

    assert.equal(props.socket.sendAudioSticker.mock.callCount(), 1);
    assert.equal(props.sendSuccessReact.mock.callCount(), 1);
    assert.equal(existsSync(videoPath), false);
    assert.equal(existsSync(stickerPath), false);
  });
}

test("reduz a mídia recusada com 413 e envia a figurinha uma única vez", async () => {
  const { props, videoPath } = propsFor({ videoMessage: { seconds: 1 } });
  const stickers = [];
  const audios = [];
  const send = mock.fn(async () => ({ id: "sent" }));
  props.socket = createSocketAdapter({
    message: {
      upload: async (source, { type, mimetype }) => {
        if (type === "ptt") {
          audios.push(source.length);
          if (audios.length === 1) throw new Error("media upload failed with status 413");
        } else {
          const image = new webp.Image();
          await image.load(source);
          assert.equal(image.width, image.height);
          assert.equal(image.hasAlpha, false);
          stickers.push({ path: source, size: (await stat(source)).size });
          if (stickers.length === 1) throw new Error("media upload failed with status 413");
        }
        return { directPath: "/uploaded", mimetype };
      },
      send,
    },
  });

  await command.handle(props);

  assert.equal(send.mock.callCount(), 1);
  assert.equal(props.sendSuccessReact.mock.callCount(), 1);
  assert.equal(stickers.length, 2);
  assert.ok(stickers[1].size < stickers[0].size);
  assert.ok(audios[1] < audios[0]);
  assert.equal(audios[2], audios[1]);
  assert.ok(stickers.every(({ path }) => !existsSync(path)));
  assert.equal(existsSync(videoPath), false);
});

test("avisa quando o vídeo não tem áudio e remove o download", async () => {
  const { props, videoPath } = propsFor({ videoMessage: { seconds: 1 } }, false);
  await assert.rejects(command.handle(props), (error) => {
    assert.ok(error instanceof WarningError);
    assert.match(error.message, /Verifique se ele tem som/);
    return true;
  });
  assert.equal(props.socket.sendAudioSticker.mock.callCount(), 0);
  assert.equal(props.sendSuccessReact.mock.callCount(), 0);
  assert.equal(existsSync(videoPath), false);
});

test("rejeita vídeo longo ou de visualização única antes do download", async () => {
  for (const video of [{ seconds: 11 }, { seconds: 1, viewOnce: true }]) {
    const { props } = propsFor({ videoMessage: video });
    await assert.rejects(command.handle(props), InvalidParameterError);
    assert.equal(props.downloadVideo.mock.callCount(), 0);
  }
});

test("remove vídeo e figurinha quando o envio falha", async () => {
  const { props, videoPath } = propsFor({ videoMessage: { seconds: 1 } });
  let stickerPath;
  props.socket.sendAudioSticker = async (jid, sticker) => {
    stickerPath = sticker;
    throw new Error("send failed");
  };
  await assert.rejects(command.handle(props), /send failed/);
  assert.equal(props.sendSuccessReact.mock.callCount(), 0);
  assert.equal(existsSync(videoPath), false);
  assert.equal(existsSync(stickerPath), false);
});

test("rejeita comando sem mídia ou apenas com áudio respondido", async () => {
  for (const message of [{}, {
    extendedTextMessage: { contextInfo: { quotedMessage: { audioMessage: { ptt: true } } } },
  }]) {
    const { props } = propsFor(message);
    await assert.rejects(command.handle(props), InvalidParameterError);
    assert.equal(props.socket.sendAudioSticker.mock.callCount(), 0);
  }
});

async function mockMusicFetch(t) {
  const music = await readFile(path.join(directory, "music.mp3"));
  return t.mock.method(globalThis, "fetch", async (url) => {
    assert.equal(url, mediaUrl);
    return new Response(music);
  });
}

for (const search of [
  "Nome da música",
  "https://www.youtube.com/watch?v=mW8o_WDL91o",
  "https://youtu.be/mW8o_WDL91o?si=share",
  "https://youtube.com/shorts/mW8o_WDL91o",
  "https://music.youtube.com/watch?v=mW8o_WDL91o",
]) {
  test(`usa a figurinha respondida com ${search}`, async (t) => {
    await mockMusicFetch(t);
    const sticker = { mimetype: "image/webp" };
    const { props } = propsFor({
      extendedTextMessage: { contextInfo: { quotedMessage: { stickerMessage: sticker } } },
    });
    props.fullArgs = search;

    await command.handle(props);

    const isUrl = search.startsWith("https:");
    assert.equal(download.mock.callCount(), isUrl ? 1 : 0);
    assert.equal(play.mock.callCount(), isUrl ? 0 : 1);
    assert.deepEqual((isUrl ? download : play).mock.calls[0].arguments, [
      isUrl ? "yt-mp3" : "audio", search,
    ]);
    const [jid, sentSticker, audio] = props.socket.sendAudioSticker.mock.calls[0].arguments;
    assert.equal(jid, props.remoteJid);
    assert.equal(sentSticker, sticker);
    assert.equal(audio.subarray(0, 4).toString(), "OggS");
    assert.equal(props.sendSuccessReact.mock.callCount(), 1);
  });
}

for (const quoted of [false, true]) {
  test(`usa YouTube na legenda da imagem ${quoted ? "ignorando o áudio respondido" : "sem resposta"}`, async (t) => {
    await mockMusicFetch(t);
    const { props } = propsFor({ imageMessage: quoted ? {
      contextInfo: { quotedMessage: { audioMessage: { ptt: true } } },
    } : {} });
    props.fullArgs = "https://youtu.be/mW8o_WDL91o";
    props.downloadAudio = mock.fn(async () => { throw new Error("Não deve baixar a resposta"); });
    const imagePath = path.join(directory, `image-${quoted}.png`);
    props.downloadImage = async () => {
      await copyFile(path.join(directory, "image.png"), imagePath);
      return imagePath;
    };
    let stickerPath;
    props.socket.sendAudioSticker = mock.fn(async (jid, sticker, audio) => {
      stickerPath = sticker;
      const image = new webp.Image();
      await image.load(sticker);
      assert.equal(image.width, 512);
      assert.equal(image.frames, undefined);
      const audioPath = path.join(directory, `music-${quoted}.ogg`);
      await writeFile(audioPath, audio);
      const { stdout } = await runFile("ffprobe", [
        "-v", "error", "-show_entries", "format=duration", "-of", "json", audioPath,
      ], { windowsHide: true });
      assert.ok(Math.abs(Number(JSON.parse(stdout).format.duration) - 30) < 0.1);
    });

    await command.handle(props);

    assert.equal(download.mock.callCount(), 1);
    assert.equal(play.mock.callCount(), 0);
    assert.equal(props.downloadAudio.mock.callCount(), 0);
    assert.equal(props.socket.sendAudioSticker.mock.callCount(), 1);
    assert.equal(existsSync(imagePath), false);
    assert.equal(existsSync(stickerPath), false);
  });
}

test("rejeita links inválidos ou de outro site antes de chamar a API", async () => {
  for (const search of [
    "https://",
    "https://example.com/watch?youtube.com",
    "https://youtube.com.example.com/watch?v=123",
    "https://youtu.be.example.com/123",
  ]) {
    const { props } = propsFor({
      extendedTextMessage: { contextInfo: { quotedMessage: { stickerMessage: {} } } },
    });
    props.fullArgs = search;
    await assert.rejects(command.handle(props), InvalidParameterError);
  }
  assert.equal(download.mock.callCount(), 0);
  assert.equal(play.mock.callCount(), 0);
});
