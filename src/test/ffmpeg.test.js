import assert from "node:assert";
import fs from "node:fs/promises";
import path from "node:path";
import { after, describe, it } from "node:test";
import webp from "node-webpmux";
import { TEMP_DIR } from "../config.js";
import { Ffmpeg } from "../services/ffmpeg.js";

const ANIMATED_WEBP = Buffer.from(
  "UklGRtgAAABXRUJQVlA4WAoAAAACAAAAHwAAHwAAQU5JTQYAAAD/////AABBTk1GVAAAAAAAAAAAAB8AAB8AAGQAAAJWUDggPAAAAFADAJ0BKiAAIAA+kUSdSqWjoqGoCACwEgllAMtagABFW1gAAP7Qyv18AU9Uf/0mz/gk/+CT+B+wP9AAAEFOTUZQAAAAAAAAAAAAHwAAHwAAZAAAAFZQOCA4AAAA1AIAnQEqIAAgAD6RQpxKAoCAAAEgllAMgSgABAUFAAD+6mX//npn9bfx/2ff8W5+3XMvB7VIAAA=",
  "base64",
);

const inputPath = path.join(TEMP_DIR, `animated-sticker-test-${process.pid}.webp`);
let framePath;

after(async () => {
  await Promise.all(
    [inputPath, framePath]
      .filter(Boolean)
      .map((filePath) => fs.rm(filePath, { force: true })),
  );
});

describe("Ffmpeg", () => {
  it("extrai o primeiro quadro estático de uma figurinha WebP animada", async () => {
    await fs.mkdir(TEMP_DIR, { recursive: true });
    await fs.writeFile(inputPath, ANIMATED_WEBP);

    framePath = await new Ffmpeg()._extractFirstAnimatedWebpFrame(inputPath);
    assert.ok(framePath);

    const frame = new webp.Image();
    await frame.load(framePath);
    assert.strictEqual(frame.frames, undefined);
  });
});
