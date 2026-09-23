import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import { test } from "node:test";
import command, { noteFrequency, PIANO_HTML } from "../commands/member/games/piano.js";

test("piano exposes all notes and plays the selected pitch", () => {
  assert.equal(command.name, "piano");
  assert.equal((PIANO_HTML.match(/data-note="\d+"/g) || []).length, 13);
  assert.equal(noteFrequency(9, 4), 440);
  assert.ok(Math.abs(noteFrequency(0, 4) - 261.63) < 0.01);

  const frequencies = [];
  const elements = new Map();
  function element(note) {
    const listeners = {};
    return {
      dataset: { note: String(note) },
      classList: { add() {}, remove() {} },
      addEventListener(type, handler) { listeners[type] = handler; },
      setPointerCapture() {},
      fire(type, event = {}) { listeners[type]?.(event); },
      textContent: "",
      disabled: false,
    };
  }
  for (let note = 0; note <= 12; note++) elements.set(note, element(note));
  for (const id of ["note", "range", "hint", "lower", "higher"]) elements.set(id, element());

  const document = {
    querySelectorAll: () => [...Array(13)].map((_, note) => elements.get(note)),
    querySelector: (selector) => elements.get(Number(selector.match(/\d+/)[0])),
    getElementById: (id) => elements.get(id),
    addEventListener() {},
  };
  class AudioContext {
    currentTime = 0;
    destination = {};
    createOscillator() {
      const oscillator = { frequency: { set value(value) { frequencies.push(value); } }, connect() {}, start() {}, stop() {} };
      return oscillator;
    }
    createGain() {
      return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} };
    }
  }
  const window = { AudioContext, addEventListener() {} };
  const script = PIANO_HTML.match(/<script>([\s\S]*?)<\/script>/)[1];
  runInNewContext(script, { document, window });

  assert.equal(elements.get("range").textContent, "Dó4 a Dó5");
  elements.get(1).fire("pointerdown", { preventDefault() {}, pointerId: 1 });
  assert.ok(Math.abs(frequencies.at(-1) - 277.18) < 0.01);
  assert.equal(elements.get("note").textContent, "Dó♯4");
  elements.get("higher").fire("click");
  elements.get(9).fire("pointerdown", { preventDefault() {}, pointerId: 2 });
  assert.equal(frequencies.at(-1), 880);
  assert.equal(elements.get("note").textContent, "Lá5");
});

test("piano sends the HTML game through the existing relay", async () => {
  let sent;
  let reacted = false;
  await command.handle({
    remoteJid: "group@g.us",
    socket: { relayMessage: async (jid, payload) => { sent = { jid, payload }; } },
    sendSuccessReact: async () => { reacted = true; },
    sendErrorReply: async () => { throw new Error("Unexpected error reply"); },
  });
  assert.equal(sent.jid, "group@g.us");
  const data = sent.payload.botForwardedMessage.message.richResponseMessage.unifiedResponse.data;
  const response = JSON.parse(data.toString());
  assert.equal(response.sections[0].view_model.primitive.payload, PIANO_HTML.trim());
  assert.equal(reacted, true);
});
