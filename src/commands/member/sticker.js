/**
 * Desenvolvido por: Dev Gui
 * Implementação dos metadados feita por: MRX
 *
 * @author Dev Gui
 */
const { getRandomName } = require(`${BASE_DIR}/utils`);
const { PREFIX, BOT_NAME } = require(`${BASE_DIR}/config`);
const { addStickerMetadata } = require(`${BASE_DIR}/services/sticker`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const fs = require("node:fs");
const ffmpeg = require("fluent-ffmpeg");

module.exports = {
  name: "sticker",
  description: "Cria figurinhas de imagem, gif ou vídeo (máximo 10 segundos).",
  commands: ["f", "s", "sticker", "fig"],
  usage: `${PREFIX}sticker (marque ou responda uma imagem/gif/vídeo)`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    isImage,
    isVideo,
    downloadImage,
    downloadVideo,
    webMessage,
    sendErrorReply,
    sendWaitReact,
    sendSuccessReact,
    sendStickerFromFile,
    userJid,
  }) => {
    if (!isImage && !isVideo) {
      throw new InvalidParameterError(
        `Você precisa marcar ou responder a uma imagem/gif/vídeo!`
      );
    }

    await sendWaitReact();

    const username =
      webMessage.pushName ||
      webMessage.notifyName ||
      userJid.replace(/@s.whatsapp.net/, "");

    const metadata = {
      username: username,
      botName: `🤖 ${BOT_NAME}`,
    };

    const outputPath = getRandomName("webp");

    try {
      if (isImage) {
        const inputPath = await downloadImage(webMessage, "input");

        await new Promise((resolve, reject) => {
          ffmpeg(inputPath)
            .size("512x512")
            .output(outputPath)
            .on("end", resolve)
            .on("error", reject)
            .run();
        });

        fs.unlinkSync(inputPath);
      } else {
        const inputPath = await downloadVideo(webMessage, "input");

        const maxDuration = 10;
        const seconds =
          webMessage.message?.videoMessage?.seconds ||
          webMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage
            ?.videoMessage?.seconds;

        if (!seconds || seconds > maxDuration) {
          fs.unlinkSync(inputPath);
          return sendErrorReply(
            `O vídeo enviado tem mais de ${maxDuration} segundos! Envie um vídeo menor.`
          );
        }

        await new Promise((resolve, reject) => {
          ffmpeg(inputPath)
            .videoCodec("libwebp")
            .size("512x512")
            .fps(12)
            .outputOptions([
              "-fs",
              "0.99M",
              "-vf",
              "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=white@0.0",
              "-loop",
              "0",
              "-preset",
              "default",
              "-an",
              "-vsync",
              "0",
            ])
            .format("webp")
            .output(outputPath)
            .on("end", resolve)
            .on("error", reject)
            .run();
        });

        fs.unlinkSync(inputPath);
      }

      const stickerPath = await addStickerMetadata(
        await fs.promises.readFile(outputPath),
        metadata
      );

      await sendSuccessReact();

      await sendStickerFromFile(stickerPath);

      fs.unlinkSync(outputPath);
      fs.unlinkSync(stickerPath);
    } catch (error) {
      console.error(error);
      throw new Error(`Erro ao processar a figurinha: ${error.message}`);
    }
  },
};
