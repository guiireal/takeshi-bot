import fs from "node:fs";
import path from "node:path";
import { BOT_EMOJI, BOT_NAME, PREFIX, TEMP_DIR } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { Ffmpeg } from "../../services/ffmpeg.js";
import { removeBg } from "../../services/spider-x-api.js";
import { processStaticSticker } from "../../services/sticker.js";
import {
  getRandomName,
  getUserName,
  removeFileIfExists,
} from "../../utils/index.js";

export default {
  name: "removebg",
  description: "Remove o fundo de imagens e figurinhas.",
  commands: ["removebg", "rmbg", "remove-bg"],
  usage: `${PREFIX}removebg (marque ou responda uma imagem/figurinha)`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    isImage,
    isSticker,
    downloadImage,
    downloadSticker,
    sendImageFromBuffer,
    sendStickerFromFile,
    sendWaitReact,
    sendSuccessReact,
    webMessage,
    userLid,
  }) => {
    if (!isImage && !isSticker) {
      throw new InvalidParameterError(
        "Você precisa marcar ou responder uma imagem ou figurinha!",
      );
    }

    await sendWaitReact();

    const ffmpeg = new Ffmpeg();
    let inputPath = null;
    let convertedImagePath = null;
    let removeBgPath = null;
    let finalStickerPath = null;

    try {
      if (isImage) {
        inputPath = await downloadImage(webMessage, getRandomName());

        const inputBuffer = await fs.promises.readFile(inputPath);
        const outputBuffer = await removeBg(
          inputBuffer,
          "image/png",
          "imagem.png",
        );

        await sendSuccessReact();
        await sendImageFromBuffer(outputBuffer);
        return;
      }

      inputPath = await downloadSticker(webMessage, getRandomName());
      removeBgPath = path.resolve(TEMP_DIR, getRandomName("png"));

      convertedImagePath = await ffmpeg.convertStickerToImage(inputPath);

      const inputBuffer = await fs.promises.readFile(convertedImagePath);
      const outputBuffer = await removeBg(
        inputBuffer,
        "image/png",
        "sticker.png",
      );
      await fs.promises.writeFile(removeBgPath, outputBuffer);

      finalStickerPath = await processStaticSticker(removeBgPath, {
        username: getUserName(webMessage, userLid),
        botName: `${BOT_EMOJI} ${BOT_NAME}`,
      });

      await sendSuccessReact();
      await sendStickerFromFile(finalStickerPath);
    } finally {
      removeFileIfExists(inputPath);
      removeFileIfExists(convertedImagePath);
      removeFileIfExists(removeBgPath);
      removeFileIfExists(finalStickerPath);
    }
  },
};
