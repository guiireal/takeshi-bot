import assert from "node:assert/strict";
import { after, afterEach, before, mock, test } from "node:test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { ajustAudioByBuffer } from "../utils/index.js";
import { loadCommonFunctions } from "../utils/loadCommonFunctions.js";

const run = promisify(execFile);
let folder;
const samples = {};

before(async () => {
  folder = await fs.mkdtemp(path.join(os.tmpdir(), "takeshi-audio-test-"));
  for (const [name, codec, ext] of [["aac", "aac", "m4a"], ["mp3", "libmp3lame", "mp3"], ["alac", "alac", "m4a"]]) {
    const file = path.join(folder, `${name}.${ext}`);
    await run("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "sine=frequency=440:duration=0.2", "-c:a", codec, file]);
    samples[name] = { file, buffer: await fs.readFile(file) };
  }
});

afterEach(() => mock.restoreAll());
after(async () => { if (folder) await fs.rm(folder, { recursive: true, force: true }); });

async function cleanup(result) {
  for (const file of [result?.audioPath, result?.oldAudioPath].filter(Boolean)) await fs.rm(file, { force: true });
}

test("AAC/M4A e MP3 prontos são preservados byte a byte sem deixar arquivos temporários", async () => {
  for (const [name, mimetype] of [["aac", "audio/mp4"], ["mp3", "audio/mpeg"]]) {
    const result = await ajustAudioByBuffer(samples[name].buffer, false);
    try {
      assert.ok(result.audioBuffer === samples[name].buffer, `${name} foi recodificado`);
      assert.equal(result.mimetype, mimetype);
      assert.equal(result.audioPath, undefined);
      assert.equal(result.oldAudioPath, undefined);
    } finally { await cleanup(result); }
  }
});

test("M4A com ALAC continua sendo convertido e mensagem de voz continua Opus", async () => {
  for (const [name, ptt, codec, mimetype] of [["alac", false, "mp3", "audio/mpeg"], ["aac", true, "opus", "audio/ogg; codecs=opus"]]) {
    const result = await ajustAudioByBuffer(samples[name].buffer, ptt);
    try {
      const { stdout } = await run("ffprobe", ["-v", "error", "-show_entries", "stream=codec_name", "-of", "json", result.audioPath]);
      assert.equal(JSON.parse(stdout).streams[0].codec_name, codec);
      assert.equal(result.mimetype, mimetype);
    } finally { await cleanup(result); }
  }
});

function sender() {
  const calls = [];
  const socket = { sendMessage: async (...args) => { calls.push(args); return { key: { id: "sent" } }; } };
  const webMessage = { key: { remoteJid: "test@g.us", participant: "member@lid", id: "source" }, message: { conversation: "/play teste" } };
  return { calls, helpers: loadCommonFunctions({ socket, webMessage }) };
}

test("envio por arquivo, buffer e URL preserva AAC, mimetype e citação", async () => {
  const { calls, helpers } = sender();
  mock.method(globalThis, "fetch", async () => new Response(samples.aac.buffer));
  await helpers.sendAudioFromFile(samples.aac.file);
  await helpers.sendAudioFromBuffer(samples.aac.buffer);
  await helpers.sendAudioFromURL("https://media.test/audio.m4a");
  assert.equal(calls.length, 3);
  for (const [, content, options] of calls) {
    assert.ok(content.audio.equals(samples.aac.buffer));
    assert.equal(content.mimetype, "audio/mp4");
    assert.equal(content.ptt, false);
    assert.equal(options.quoted.key.id, "source");
  }
});

test("URL baixa o corpo enquanto a capa está pendente e só envia depois dela", async () => {
  const { calls, helpers } = sender();
  const cover = Promise.withResolvers();
  const downloaded = Promise.withResolvers();
  mock.method(globalThis, "fetch", async () => ({ ok: true, arrayBuffer: async () => {
    downloaded.resolve();
    return samples.mp3.buffer;
  } }));
  const sending = helpers.sendAudioFromURL("https://media.test/audio.mp3", false, false, cover.promise);
  await downloaded.promise;
  await new Promise(setImmediate);
  assert.equal(calls.length, 0);
  cover.resolve();
  await sending;
  assert.equal(calls.length, 1);
  assert.equal(calls[0][2].quoted, undefined);
});

test("falha da capa ou HTTP não envia áudio nem deixa rejeição sem tratamento", async () => {
  const { calls, helpers } = sender();
  const fetchMock = mock.method(globalThis, "fetch", async () => new Response(samples.mp3.buffer));
  await assert.rejects(helpers.sendAudioFromURL("https://media.test/audio", false, true, Promise.reject(new Error("capa falhou"))), /capa falhou/);
  fetchMock.mock.mockImplementation(async () => new Response(null, { status: 403 }));
  await assert.rejects(helpers.sendAudioFromURL("https://media.test/audio"), /Failed to fetch audio/);
  assert.equal(calls.length, 0);
});
