import fs from "node:fs";
import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { errorLog } from "../../utils/logger.js";

export default {
  name: "set-menu-image",
  description: "Altera a imagem do menu do bot",
  commands: [
    "set-menu-image",
    "set-image",
    "set-imagem-menu",
    "set-img-menu",
    "set-menu-imagem",
    "set-menu-img",
  ],
  usage: `${PREFIX}set-menu-image (responda a uma imagem)`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    isImage,
    isReply,
    downloadImage,
    sendSuccessReply,
    sendErrorReply,
    webMessage,
  }) => {
    if (!isReply || !isImage) {
      throw new InvalidParameterError(
        "Você precisa responder a uma mensagem que contenha uma imagem!"
      );
    }

    try {
      const menuImagePath = path.join(ASSETS_DIR, "images", "takeshi-bot.png");

      let backupPath = "";

      if (fs.existsSync(menuImagePath)) {
        backupPath = path.join(ASSETS_DIR, "images", "takeshi-bot-backup.png");

        fs.copyFileSync(menuImagePath, backupPath);
      }

      const tempPath = await downloadImage(webMessage, "new-menu-image-temp");

      if (fs.existsSync(menuImagePath)) {
        fs.unlinkSync(menuImagePath);
      }

      fs.renameSync(tempPath, menuImagePath);

      await sendSuccessReply("Imagem do menu atulizada com sucesso !");
    } catch (error) {
      errorLog(`Erro ao alterar imagem do menu:  ${error}`);
      await sendErrorReply(
        "Ocorreu um erro ao tentar alterar a imagem do menu. Por favor, tente novamente."
      );
    }
  },
};
