import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import command, { SUPERPIANO_HTML } from "../commands/member/games/superpiano.js";

test("superpiano alterna entre uma e duas oitavas, toca e aplica sustain", () => {
  const frequencies = [];
  const stopTimes = [];
  const elements = new Map();
  function element() {
    const listeners = {};
    return {
      children: [],
      dataset: {},
      style: {},
      classList: { add() {}, remove() {}, toggle() {} },
      addEventListener(type, handler) { listeners[type] = handler; },
      appendChild(child) { this.children.push(child); },
      set innerHTML(_) { this.children = []; },
      fire(type, event = {}) { listeners[type]?.(event); },
      textContent: "",
    };
  }
  for (const id of ["pn", "nd", "octlbl", "odn", "oup", "s1", "s2", "sus"]) elements.set(id, element());
  const document = {
    getElementById: (id) => elements.get(id),
    createElement: () => element(),
  };
  class AudioContext {
    currentTime = 0;
    destination = {};
    createGain() {
      return { gain: { value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} };
    }
    createOscillator() {
      return { frequency: { set value(value) { frequencies.push(value); } }, connect() {}, start() {}, stop(time) { stopTimes.push(time); } };
    }
  }
  const script = SUPERPIANO_HTML.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script);
  runInNewContext(script, { document, window: { AudioContext } });

  const piano = elements.get("pn");
  assert.equal(piano.children.length, 13);
  piano.children[0].fire("pointerdown", { preventDefault() {} });
  assert.equal(frequencies[0], 261.63);
  assert.ok(Math.abs(stopTimes[0] - 1.35) < 0.001);

  elements.get("s2").fire("click");
  assert.equal(piano.children.length, 25);
  elements.get("oup").fire("click");
  assert.equal(elements.get("octlbl").textContent, "C5");
  elements.get("sus").fire("click");
  piano.children[0].fire("pointerdown", { preventDefault() {} });
  assert.equal(frequencies[3], 523.26);
  assert.ok(Math.abs(stopTimes[3] - 2.65) < 0.001);
});

test("superpiano usa o envio HTML existente", async () => {
  assert.deepEqual(command.commands, ["superpiano"]);
  let payload;
  await command.handle({
    remoteJid: "group@g.us",
    socket: { relayMessage: async (_, message) => { payload = message; } },
    sendSuccessReact: async () => {},
    sendErrorReply: async () => { throw new Error("Unexpected error reply"); },
  });
  const data = payload.botForwardedMessage.message.richResponseMessage.unifiedResponse.data;
  assert.equal(JSON.parse(data.toString()).sections[0].view_model.primitive.payload, SUPERPIANO_HTML.trim());
});
