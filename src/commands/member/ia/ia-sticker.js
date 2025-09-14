const fs = require("node:fs");
const path = require("node:path");
const { exec } = require("node:child_process");

const { PREFIX, TEMP_DIR } = require(`${BASE_DIR}/config`);
const { getBuffer, getRandomName } = require(`${BASE_DIR}/utils`);
const { imageAI } = require(`${BASE_DIR}/services/spider-x-api`);

module.exports = {
  name: "ia-sticker",
  description: "Cria uma figurinha com base em uma descrição",
  commands: ["ia-sticker", "ia-fig"],
  usage: `${PREFIX}ia-sticker descrição`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    args,
    sendWaitReply,
    sendWarningReply,
    sendStickerFromFile,
    sendErrorReply,
    sendSuccessReact,
    fullArgs,
  }) => {
    if (!args[0]) {
      return sendWarningReply(
        "Você precisa fornecer uma descrição para a imagem."
      );
    }

    await sendWaitReply("gerando figurinha...");

    const data = await imageAI(fullArgs);

    if (data.image) {
      const buffer = await getBuffer(data.image);

      const inputTempPath = path.resolve(TEMP_DIR, getRandomName("png"));
      const outputTempPath = path.resolve(TEMP_DIR, getRandomName("webp"));

      fs.writeFileSync(inputTempPath, buffer);

      const cmd = `ffmpeg -i "${inputTempPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease" -f webp -quality 90 "${outputTempPath}"`;

      exec(cmd, async (error, _, stderr) => {
        if (error) {
          console.error("FFmpeg error:", error);
          await sendErrorReply(
            `Houve um erro ao processar a imagem. Tente novamente mais tarde!

Detalhes: ${stderr}`
          );
        } else {
          await sendSuccessReact();
          await sendStickerFromFile(outputTempPath);
          fs.unlinkSync(inputTempPath);
          fs.unlinkSync(outputTempPath);
        }
      });
    } else {
      await sendWarningReply(
        "Não foi possível gerar a figurinha. Tente novamente mais tarde."
      );
    }
  },
};
