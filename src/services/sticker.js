/**
 * Serviços para processar figurinhas (stickers) no ffmpeg.
 *
 * @author MRX
 */
const { TEMP_DIR } = require("../config");
const path = require("node:path");
const fs = require("node:fs");
const webp = require("node-webpmux");
const { getRandomName, getRandomNumber } = require("../utils");
const { exec } = require("child_process");

async function addStickerMetadata(media, metadata) {
  const tmpFileIn = getRandomName("webp");
  const tmpFileOut = getRandomName("webp");

  await fs.promises.writeFile(tmpFileIn, media);

  const img = new webp.Image();

  const json = {
    "sticker-pack-id": `${getRandomNumber(10_000, 99_999)}`,
    "sticker-pack-name": metadata.username,
    "sticker-pack-publisher": metadata.botName,
    emojis: metadata.categories ? metadata.categories : [""],
  };

  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
    0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
  ]);

  const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
  const exif = Buffer.concat([exifAttr, jsonBuff]);
  exif.writeUIntLE(jsonBuff.length, 14, 4);

  await img.load(tmpFileIn);
  await fs.promises.unlink(tmpFileIn);
  img.exif = exif;
  await img.save(tmpFileOut);
  return tmpFileOut;
}

exports.addStickerMetadata = addStickerMetadata;

exports.isAnimatedSticker = async (filePath) => {
  return new Promise((resolve) => {
    exec(
      `ffprobe -v quiet -show_entries format=duration -of csv="p=0" "${filePath}"`,
      (error, stdout) => {
        if (error) {
          resolve(false);
          return;
        }
        const duration = parseFloat(stdout.trim());
        resolve(duration > 0);
      }
    );
  });
};

exports.processStaticSticker = async (inputPath, metadata) => {
  return new Promise((resolve, reject) => {
    const tempOutputPath = path.resolve(TEMP_DIR, getRandomName("webp"));

    const cmd = `ffmpeg -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2" -f webp -quality 90 "${tempOutputPath}"`;

    exec(cmd, async (error, _, stderr) => {
      try {
        if (error) {
          console.error("FFmpeg error:", stderr);
          reject(new Error("Erro ao processar figurinha estática."));
          return;
        }

        const processedBuffer = await fs.promises.readFile(tempOutputPath);
        const finalPath = await addStickerMetadata(processedBuffer, metadata);

        if (fs.existsSync(tempOutputPath)) {
          fs.unlinkSync(tempOutputPath);
        }

        resolve(finalPath);
      } catch (error) {
        if (fs.existsSync(tempOutputPath)) {
          fs.unlinkSync(tempOutputPath);
        }
        reject(error);
      }
    });
  });
};

exports.processAnimatedSticker = async (inputPath, metadata) => {
  return new Promise((resolve, reject) => {
    const tempOutputPath = path.resolve(TEMP_DIR, getRandomName("webp"));

    const cmd = `ffmpeg -i "${inputPath}" -t 8 -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2,fps=15" -c:v libwebp -quality 75 -compression_level 6 -loop 0 -preset default -an -f webp "${tempOutputPath}"`;

    exec(cmd, async (error, _, stderr) => {
      try {
        if (error) {
          console.error("FFmpeg error:", stderr);
          reject(new Error("Erro ao processar figurinha animada."));
          return;
        }

        const processedBuffer = await fs.promises.readFile(tempOutputPath);
        const finalPath = await addStickerMetadata(processedBuffer, metadata);

        if (fs.existsSync(tempOutputPath)) {
          fs.unlinkSync(tempOutputPath);
        }

        resolve(finalPath);
      } catch (error) {
        if (fs.existsSync(tempOutputPath)) {
          fs.unlinkSync(tempOutputPath);
        }
        reject(error);
      }
    });
  });
};
