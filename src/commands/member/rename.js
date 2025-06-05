const fs = require("node:fs");
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError, DangerError } = require(`${BASE_DIR}/errors`);
const {
  isAnimatedSticker,
  processStaticSticker,
  processAnimatedSticker,
  addStickerMetadata,
} = require(`${BASE_DIR}/services/sticker`);
const { getRandomName } = require(`${BASE_DIR}/utils`);

module.exports = {
  name: "rename",
  description: "Adiciona novos meta-dados à figurinha.",
  commands: ["rename", "renomear", "rn"],
  usage: `${PREFIX}rename pacote / autor (responda a uma figurinha)`,
  handle: async ({
    isSticker,
    downloadSticker,
    webMessage,
    sendWaitReact,
    sendSuccessReact,
    sendStickerFromFile,
    args,
  }) => {
    if (!isSticker) {
      throw new InvalidParameterError(
        "Você precisa responder a uma figurinha!"
      );
    }

    if (args.length !== 2) {
      throw new InvalidParameterError(
        "Você precisa fornecer o pacote e o autor no formato: pacote / autor"
      );
    }

    const pack = args[0];
    const author = args[1];

    if (!pack || !author) {
      throw new InvalidParameterError(
        "Você precisa fornecer o pacote e o autor no formato: pacote / autor"
      );
    }

    const minLength = 2;
    const maxLength = 50;

    if (pack.length < minLength || pack.length > maxLength) {
      throw new DangerError(
        `O pacote deve ter entre ${minLength} e ${maxLength} caracteres.`
      );
    }

    if (author.length < minLength || author.length > maxLength) {
      throw new DangerError(
        `O autor deve ter entre ${minLength} e ${maxLength} caracteres.`
      );
    }

    let finalStickerPath = null;

    await sendWaitReact();

    const inputPath = await downloadSticker(webMessage, getRandomName("webp"));

    try {
      const metadata = {
        username: pack,
        botName: author,
      };

      const isAnimated = await isAnimatedSticker(inputPath);

      if (isAnimated) {
        finalStickerPath = await processAnimatedSticker(
          inputPath,
          metadata,
          addStickerMetadata
        );
      } else {
        finalStickerPath = await processStaticSticker(
          inputPath,
          metadata,
          addStickerMetadata
        );
      }

      await sendSuccessReact();

      await sendStickerFromFile(finalStickerPath);
    } catch (error) {
      throw new Error(`Erro ao renomear a figurinha: ${error.message}`);
    } finally {
      if (fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath);
      }

      if (finalStickerPath && fs.existsSync(finalStickerPath)) {
        fs.unlinkSync(finalStickerPath);
      }
    }
  },
};
