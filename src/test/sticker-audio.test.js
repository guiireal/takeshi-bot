import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { copyFile, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, beforeEach, mock, test } from "node:test";
import { promisify } from "node:util";
import webp from "node-webpmux";
import { PREFIX } from "../config.js";
import { AudioStickerUploadTooLargeError, InvalidParameterError, WarningError } from "../errors/index.js";
import { processAutoSticker } from "../services/sticker.js";
import { createSocketAdapter } from "../services/wa.js";
import { extractDataFromMessage } from "../utils/index.js";

const mediaUrl = "https://media.invalid/audio.mp3";
const play = mock.fn(async () => ({ url: mediaUrl }));
const download = mock.fn(async () => ({ url: mediaUrl }));
mock.module("../services/spider-x-api.js", {
  namedExports: { play, download },
});
const { default: command } = await import("../commands/member/sticker-audio.js");

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
  await runFile("ffmpeg", [
    "-f", "lavfi", "-i", "color=blue:size=64x64", "-frames:v", "1",
    path.join(directory, "sticker.webp"),
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
  const webMessage = { message, pushName: "Test" };
  const props = {
    socket: { sendAudioSticker: mock.fn(async () => {}) },
    remoteJid: "stickeraudio-test@g.us",
    userLid: "123@lid",
    webMessage,
    fullArgs: extractDataFromMessage(webMessage).fullArgs,
    sendWaitReact: mock.fn(async () => {}),
    sendSuccessReact: mock.fn(async () => {}),
    sendStickerFromFile: mock.fn(async (stickerPath) => {
      const image = new webp.Image();
      await image.load(stickerPath);
      assert.ok(image.frames.length > 1);
      await rm(stickerPath);
    }),
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

test("tenta até 990 KB e reduz os quadros se o upload recusar o tamanho", async () => {
  const { props, videoPath } = propsFor({ videoMessage: { seconds: 2 } });
  props.downloadVideo.mock.mockImplementation(async () => {
    await runFile("ffmpeg", [
      "-f", "lavfi", "-i", "life=size=320x320:rate=15:seed=123",
      "-f", "lavfi", "-i", "sine=duration=2", "-t", "2",
      "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", videoPath,
    ], { windowsHide: true });
    return videoPath;
  });
  const attempts = [];
  props.socket.sendAudioSticker = async (jid, stickerPath, audio) => {
    const image = new webp.Image();
    await image.load(stickerPath);
    const size = (await stat(stickerPath)).size;
    attempts.push({ size, audio, width: image.width, delay: image.frames[0].delay });
    if (size > 499_000) throw new AudioStickerUploadTooLargeError("sticker");
  };

  await command.handle(props);

  assert.equal(attempts.length, 2);
  assert.ok(attempts[0].size > 499_000 && attempts[0].size <= 990_000);
  assert.ok(attempts[1].size <= 499_000);
  assert.equal(attempts[1].audio, attempts[0].audio);
  assert.equal(attempts[1].width, attempts[0].width);
  assert.equal(attempts[1].delay, 250);
});

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

for (const quoted of [false, true]) {
  test(`envia figurinha comum do vídeo sem áudio ${quoted ? "respondido" : "anexado"}`, async () => {
    const video = { seconds: 1 };
    const message = quoted
      ? { extendedTextMessage: { contextInfo: { quotedMessage: { videoMessage: video } } } }
      : { videoMessage: video };
    const { props, videoPath } = propsFor(message, false);
    await command.handle(props);
    assert.equal(props.downloadVideo.mock.callCount(), 1);
    assert.equal(props.sendStickerFromFile.mock.callCount(), 1);
    assert.equal(props.socket.sendAudioSticker.mock.callCount(), 0);
    assert.equal(props.sendWaitReact.mock.callCount(), 1);
    assert.equal(props.sendSuccessReact.mock.callCount(), 1);
    assert.equal(existsSync(videoPath), false);
  });
}

test("mantém o aviso de extração de áudio quando o vídeo está inválido", async () => {
  const { props, videoPath } = propsFor({ videoMessage: { seconds: 1 } });
  props.downloadVideo.mock.mockImplementation(async () => {
    await writeFile(videoPath, "invalid video");
    return videoPath;
  });
  await assert.rejects(command.handle(props), WarningError);
  assert.equal(props.sendStickerFromFile.mock.callCount(), 0);
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
  for (const message of [{}, { imageMessage: { caption: `${PREFIX}stickeraudio` } }, {
    extendedTextMessage: { contextInfo: { quotedMessage: { audioMessage: { ptt: true } } } },
  }]) {
    const { props } = propsFor(message);
    await assert.rejects(command.handle(props), InvalidParameterError);
    assert.equal(props.socket.sendAudioSticker.mock.callCount(), 0);
  }
});

test("figurinha automática ignora áudio enviado sozinho", async () => {
  const { props } = propsFor({ audioMessage: { ptt: true } });
  assert.equal(await processAutoSticker(props), false);
  assert.equal(props.sendStickerFromFile.mock.callCount(), 0);
  assert.equal(props.socket.sendAudioSticker.mock.callCount(), 0);
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
    const quotedPath = path.join(directory, `quoted-${sequence++}.webp`);
    props.downloadSticker = mock.fn(async () => {
      await copyFile(path.join(directory, "sticker.webp"), quotedPath);
      return quotedPath;
    });
    let packName;
    props.socket.sendAudioSticker = mock.fn(async (_jid, sentSticker) => {
      const image = new webp.Image();
      await image.load(sentSticker);
      packName = JSON.parse(image.exif.subarray(22).toString())["sticker-pack-name"];
    });

    await command.handle(props);

    const isUrl = search.startsWith("https:");
    assert.equal(download.mock.callCount(), isUrl ? 1 : 0);
    assert.equal(play.mock.callCount(), isUrl ? 0 : 1);
    assert.deepEqual((isUrl ? download : play).mock.calls[0].arguments, [
      isUrl ? "yt-mp3" : "audio",
      isUrl ? "https://www.youtube.com/watch?v=mW8o_WDL91o" : search,
    ]);
    const [jid, sentSticker, audio] = props.socket.sendAudioSticker.mock.calls[0].arguments;
    assert.equal(jid, props.remoteJid);
    // A figurinha respondida sai renomeada com o nome de quem pediu.
    assert.equal(packName, "Test");
    assert.equal(existsSync(sentSticker), false);
    assert.equal(existsSync(quotedPath), false);
    assert.equal(audio.subarray(0, 4).toString(), "OggS");
    assert.equal(props.sendSuccessReact.mock.callCount(), 1);
  });
}

test("usa a figurinha respondida original quando não dá para renomear", async (t) => {
  await mockMusicFetch(t);
  const sticker = { mimetype: "image/webp" };
  const message = { extendedTextMessage: { contextInfo: { quotedMessage: { stickerMessage: sticker } } } };

  const failedDownload = propsFor(message).props;
  failedDownload.fullArgs = "Nome da música";
  failedDownload.downloadSticker = mock.fn(async () => null);
  await command.handle(failedDownload);
  assert.equal(failedDownload.socket.sendAudioSticker.mock.calls[0].arguments[1], sticker);

  const tooLarge = propsFor(message).props;
  tooLarge.fullArgs = "Nome da música";
  tooLarge.downloadSticker = mock.fn(async () => {
    const quotedPath = path.join(directory, `quoted-${sequence++}.webp`);
    await copyFile(path.join(directory, "sticker.webp"), quotedPath);
    return quotedPath;
  });
  tooLarge.socket.sendAudioSticker = mock.fn(async (_jid, sentSticker) => {
    if (typeof sentSticker === "string") throw new AudioStickerUploadTooLargeError("sticker");
  });
  await command.handle(tooLarge);
  const [first, second] = tooLarge.socket.sendAudioSticker.mock.calls.map((call) => call.arguments[1]);
  assert.equal(typeof first, "string");
  assert.equal(second, sticker);
});

for (const [search, quoted] of [
  ["Nome da música", false],
  ["https://youtu.be/mW8o_WDL91o?si=share", false],
  ["https://music.youtube.com/watch?v=mW8o_WDL91o", true],
  ["", true],
]) {
  test(`usa ${search || "o áudio respondido"} com a imagem na legenda`, async (t) => {
    if (search) await mockMusicFetch(t);
    const audioMessage = { ptt: true };
    const { props } = propsFor({ imageMessage: {
      caption: `${PREFIX}stickeraudio ${search}`.trimEnd(),
      contextInfo: quoted ? { quotedMessage: { audioMessage } } : undefined,
    } });
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
      if (!search) {
        assert.equal(audio, audioMessage);
        return;
      }
      const audioPath = path.join(directory, `music-${quoted}.ogg`);
      await writeFile(audioPath, audio);
      const { stdout } = await runFile("ffprobe", [
        "-v", "error", "-show_entries", "format=duration", "-of", "json", audioPath,
      ], { windowsHide: true });
      assert.ok(Math.abs(Number(JSON.parse(stdout).format.duration) - 30) < 0.1);
    });

    await command.handle(props);

    if (search.startsWith("https:")) {
      assert.deepEqual(download.mock.calls.map(({ arguments: args }) => args), [
        ["yt-mp3", "https://www.youtube.com/watch?v=mW8o_WDL91o"],
      ]);
      assert.equal(play.mock.callCount(), 0);
    } else {
      assert.equal(download.mock.callCount(), 0);
      assert.deepEqual(play.mock.calls.map(({ arguments: args }) => args), search ? [["audio", search]] : []);
    }
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
    "https://youtube.com/",
    "https://youtube.com/watch?v=123",
    "https://youtube.com/channel/mW8o_WDL91o",
    "https://youtube.com/playlist?list=mW8o_WDL91o",
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
