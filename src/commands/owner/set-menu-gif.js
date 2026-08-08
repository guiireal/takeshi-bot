import fs from "node:fs";
import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { Ffmpeg } from "../../services/ffmpeg.js";
import { errorLog } from "../../utils/logger.js";

export default {
  name: "set-menu-gif",
  description:
    "Altera o GIF do menu do bot (GIF vira MP4, ou MP4 vira o GIF do menu)",
  commands: [
    "set-menu-gif",
    "set-gif",
    "set-gif-menu",
    "set-menu-video",
    "set-video-menu",
  ],
  usage: `${PREFIX}set-menu-gif (responda a um GIF ou MP4)`,
  handle: async ({
    isImage,
    isVideo,
    downloadImage,
    downloadVideo,
    sendSuccessReply,
    sendErrorReply,
    sendWaitReact,
    webMessage,
  }) => {
    if (!isImage && !isVideo) {
      throw new InvalidParameterError(
        "Você precisa enviar ou responder a um GIF ou a um vídeo (MP4)!",
      );
    }

    const ffmpeg = new Ffmpeg();
    let tempPath = "";
    let convertedPath = "";

    try {
      await sendWaitReact();

      const menuGifPath = path.join(ASSETS_DIR, "videos", "takeshi-bot.mp4");
      const videosDir = path.dirname(menuGifPath);

      if (!fs.existsSync(videosDir)) {
        fs.mkdirSync(videosDir, { recursive: true });
      }

      if (fs.existsSync(menuGifPath)) {
        const backupPath = path.join(
          ASSETS_DIR,
          "videos",
          "takeshi-bot-backup.mp4",
        );
        fs.copyFileSync(menuGifPath, backupPath);
      }

      if (isVideo) {
        tempPath = await downloadVideo(webMessage, "new-menu-gif-temp");
        convertedPath = tempPath;
      } else {
        tempPath = await downloadImage(webMessage, "new-menu-gif-temp");
        convertedPath = await ffmpeg.convertGifToMp4(tempPath);
      }

      if (fs.existsSync(menuGifPath)) {
        fs.unlinkSync(menuGifPath);
      }

      fs.copyFileSync(convertedPath, menuGifPath);

      await sendSuccessReply("GIF do menu atualizado com sucesso!");
    } catch (error) {
      errorLog(`Erro ao alterar GIF do menu: ${error}`);
      await sendErrorReply(
        "Ocorreu um erro ao tentar alterar o GIF do menu. Por favor, tente novamente.",
      );
    } finally {
      if (tempPath && fs.existsSync(tempPath)) {
        try {
          fs.unlinkSync(tempPath);
        } catch {}
      }

      if (
        convertedPath &&
        convertedPath !== tempPath &&
        fs.existsSync(convertedPath)
      ) {
        try {
          fs.unlinkSync(convertedPath);
        } catch {}
      }
    }
  },
};
