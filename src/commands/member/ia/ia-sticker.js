import { exec as execChild } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { PREFIX, TEMP_DIR } from "../../../config.js";
import { imageAI } from "../../../services/spider-x-api.js";
import { getBuffer, getRandomName } from "../../../utils/index.js";

export default {
  name: "ia-sticker",
  description: "Cria uma figurinha com base em uma descrição",
  commands: ["ia-sticker", "ia-fig"],
  usage: `${PREFIX}ia-sticker descrição`,
  /**
   * @param {CommandHandleProps} props
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

      execChild(cmd, async (error, _, stderr) => {
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
