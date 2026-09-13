import assert from "node:assert";
import fs from "node:fs/promises";
import path from "node:path";
import { after, describe, it } from "node:test";
import { TEMP_DIR } from "../config.js";
import { Ffmpeg } from "../services/ffmpeg.js";

const ANIMATED_WEBP = Buffer.from(
  "UklGRtgAAABXRUJQVlA4WAoAAAACAAAAHwAAHwAAQU5JTQYAAAD/////AABBTk1GVAAAAAAAAAAAAB8AAB8AAGQAAAJWUDggPAAAAFADAJ0BKiAAIAA+kUSdSqWjoqGoCACwEgllAMtagABFW1gAAP7Qyv18AU9Uf/0mz/gk/+CT+B+wP9AAAEFOTUZQAAAAAAAAAAAAHwAAHwAAZAAAAFZQOCA4AAAA1AIAnQEqIAAgAD6RQpxKAoCAAAEgllAMgSgABAUFAAD+6mX//npn9bfx/2ff8W5+3XMvB7VIAAA=",
  "base64",
);

const inputPath = path.join(TEMP_DIR, `animated-sticker-test-${process.pid}.webp`);
let outputPath;

after(async () => {
  await Promise.all(
    [inputPath, outputPath]
      .filter(Boolean)
      .map((filePath) => fs.rm(filePath, { force: true })),
  );
});

describe("Ffmpeg", () => {
  it("converte o primeiro quadro de uma figurinha WebP animada em PNG", async () => {
    await fs.mkdir(TEMP_DIR, { recursive: true });
    await fs.writeFile(inputPath, ANIMATED_WEBP);

    outputPath = await new Ffmpeg().convertStickerToImage(inputPath);

    const output = await fs.readFile(outputPath);
    assert.deepStrictEqual(output.subarray(1, 4).toString("ascii"), "PNG");
  });
});
