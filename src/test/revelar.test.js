import assert from "node:assert/strict";
import * as childProcess from "node:child_process";
import fs from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, mock, test } from "node:test";
import { DangerError, InvalidParameterError, WarningError } from "../errors/index.js";
import { __clearViewOnceCache, rememberViewOnceMessage } from "../utils/viewOnceCache.js";

const exec = mock.fn((command, callback) => callback(null));
mock.module("node:child_process", {
  namedExports: { ...childProcess, exec },
});
const { default: command } = await import("../commands/admin/revelar.js");

const chatJid = "revelar-test@g.us";
let directory;

beforeEach(async () => {
  __clearViewOnceCache();
  exec.mock.resetCalls();
  directory = await mkdtemp(path.join(tmpdir(), "takeshi-revelar-"));
});

afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

function propsFor(quotedMessage) {
  return {
    webMessage: {
      key: { remoteJid: chatJid },
      message: {
        extendedTextMessage: {
          text: "/revelar",
          contextInfo: { stanzaId: "original-id", quotedMessage },
        },
      },
    },
    sendReply: mock.fn(async () => {}),
    sendWaitReact: mock.fn(async () => {}),
    sendSuccessReact: mock.fn(async () => {}),
    sendAudioFromFile: mock.fn(async () => {}),
    sendImageFromFile: mock.fn(async () => {}),
    sendVideoFromFile: mock.fn(async () => {}),
  };
}

test("reveals the original text when the quote only contains viewOnce, as in the supplied raw", async () => {
  rememberViewOnceMessage({
    chatJid, id: "original-id", type: "extendedTextMessage",
    content: { text: "Texto original\ncom outra linha", viewOnce: true },
  });
  const props = propsFor({ extendedTextMessage: { endCardTiles: [], viewOnce: true } });
  await command.handle(props);

  assert.deepEqual(props.sendReply.mock.calls[0].arguments, ["Texto original\ncom outra linha"]);
  assert.equal(props.sendSuccessReact.mock.callCount(), 1);
  assert.equal(exec.mock.callCount(), 0);
});

test("reveals text included directly in the quote and in view-once wrappers", async () => {
  const textMessage = { extendedTextMessage: { text: "Texto visível", viewOnce: true } };
  for (const quoted of [
    { conversation: "Texto visível" }, textMessage,
    ...["viewOnceMessage", "viewOnceMessageV2", "viewOnceMessageV2Extension"].map(
      (key) => ({ [key]: { message: textMessage } }),
    ),
  ]) {
    const props = propsFor(quoted);
    await command.handle(props);
    assert.deepEqual(props.sendReply.mock.calls[0].arguments, ["Texto visível"]);
  }
});

test("does not recover text from another chat or after expiry", async (t) => {
  t.mock.timers.enable({ apis: ["Date"], now: 0 });
  for (const sourceChat of ["other@g.us", chatJid]) {
    rememberViewOnceMessage({
      chatJid: sourceChat, id: "original-id", type: "extendedTextMessage",
      content: { text: "Texto protegido", viewOnce: true },
    });
    if (sourceChat === chatJid) t.mock.timers.tick(31 * 60 * 1000);
    const props = propsFor({ extendedTextMessage: { viewOnce: true } });
    await assert.rejects(command.handle(props), WarningError);
    assert.equal(props.sendReply.mock.callCount(), 0);
    assert.equal(props.sendSuccessReact.mock.callCount(), 0);
  }
});

test("rejects commands without quoted content instead of revealing the command itself", async () => {
  const props = propsFor(undefined);
  await assert.rejects(command.handle(props), InvalidParameterError);
  assert.equal(props.sendReply.mock.callCount(), 0);
});

test("reposts audio as a normal audio file and removes the temporary download", async () => {
  const inputPath = path.join(directory, "audio.ogg");
  await writeFile(inputPath, "audio fixture");
  const props = propsFor({ audioMessage: { viewOnce: true } });
  props.isAudio = true;
  props.downloadAudio = mock.fn(async (message) => {
    assert.equal(message, props.webMessage);
    return inputPath;
  });
  props.sendAudioFromFile = mock.fn(async (filePath, asVoice = false) => {
    assert.equal(filePath, inputPath);
    assert.equal(asVoice, false);
    assert.equal(fs.existsSync(filePath), true);
  });
  await command.handle(props);

  assert.equal(props.sendAudioFromFile.mock.callCount(), 1);
  assert.equal(props.sendSuccessReact.mock.callCount(), 1);
  assert.equal(fs.existsSync(inputPath), false);
  assert.equal(exec.mock.callCount(), 0);
});

test("warns when audio is unavailable without sending or reacting with success", async () => {
  const props = propsFor({ audioMessage: { viewOnce: true } });
  props.isAudio = true;
  props.downloadAudio = async () => null;
  await assert.rejects(command.handle(props), WarningError);
  assert.equal(props.sendAudioFromFile.mock.callCount(), 0);
  assert.equal(props.sendSuccessReact.mock.callCount(), 0);
});

test("cleans up audio when sending fails", async () => {
  const inputPath = path.join(directory, "audio.ogg");
  await writeFile(inputPath, "audio fixture");
  const props = propsFor({ audioMessage: { viewOnce: true } });
  props.isAudio = true;
  props.downloadAudio = async () => inputPath;
  props.sendAudioFromFile = async () => { throw new Error("send failed"); };
  await assert.rejects(command.handle(props), DangerError);
  assert.equal(fs.existsSync(inputPath), false);
  assert.equal(props.sendSuccessReact.mock.callCount(), 0);
});

for (const type of ["Image", "Video"]) {
  test(`preserves ${type.toLowerCase()} processing and sending`, async () => {
    const inputPath = path.join(directory, "input.media");
    await writeFile(inputPath, "media fixture");
    const props = propsFor({});
    props[`is${type}`] = true;
    props[`download${type}`] = async () => inputPath;
    await command.handle(props);

    assert.equal(exec.mock.callCount(), 1);
    assert.match(exec.mock.calls[0].arguments[0], type === "Image" ? /-q:v 2/ : /-c copy/);
    assert.equal(props[`send${type}FromFile`].mock.callCount(), 1);
    assert.equal(props.sendSuccessReact.mock.callCount(), 1);
    assert.equal(fs.existsSync(inputPath), false);
  });
}
