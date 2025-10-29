const { PREFIX, YTDLP_DEFAULT_VIDEO_QUALITY } = require(`${BASE_DIR}/config`);
const { downloadMedia, cleanupFile } = require(`${BASE_DIR}/services/ytdlpService`);
const { WarningError } = require(`${BASE_DIR}/errors`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const fs = require("fs");

module.exports = {
  name: "yt-mp4",
  description: "Faço o download de vídeos do YouTube pelo link!",
  commands: ["yt-mp4", "youtube-mp4", "yt-video", "youtube-video", "mp4"],
  usage: `${PREFIX}yt-mp4 https://www.youtube.com/watch?v=mW8o_WDL91o`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    socket,
    remoteJid,
    webMessage,
    sendImageFromURL,
    fullArgs,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReply,
  }) => {
    if (!fullArgs.length) {
      throw new InvalidParameterError(
        "Você precisa enviar uma URL do YouTube!"
      );
    }

    if (!fullArgs.includes("http://") && !fullArgs.includes("https://")) {
      throw new InvalidParameterError(
        "Você precisa enviar uma URL válida!"
      );
    }

    await sendWaitReact();

    let filePath = null;

    try {
      const { filePath: downloadedFile, info } = await downloadMedia(
        fullArgs, 
        "video", 
        YTDLP_DEFAULT_VIDEO_QUALITY || "720"
      );
      filePath = downloadedFile;

      if (!info) {
        await sendErrorReply("Nenhum resultado encontrado!");
        return;
      }

      await sendSuccessReact();

      // Enviar thumbnail e informações
      if (info.thumbnail) {
        await sendImageFromURL(
          info.thumbnail,
          `*Título*: ${info.title}
        
*Descrição*: ${info.description.substring(0, 200)}${info.description.length > 200 ? "..." : ""}
*Duração*: ${Math.floor(info.duration / 60)}:${String(info.duration % 60).padStart(2, "0")}
*Canal*: ${info.channel.name}`
        );
      }

      // Enviar vídeo diretamente (MP4 do yt-dlp já está no formato correto)
      const videoBuffer = fs.readFileSync(filePath);
      await socket.sendMessage(
        remoteJid,
        {
          video: videoBuffer,
          mimetype: "video/mp4",
        },
        { quoted: webMessage }
      );

      // Limpar arquivo temporário após o envio
      await cleanupFile(filePath);
      filePath = null;
    } catch (error) {
      console.error(error);
      await sendErrorReply(
        error.message || "Erro desconhecido durante o download do vídeo!"
      );
    } finally {
      // Limpar arquivo temporário apenas se ainda não foi limpo
      if (filePath) {
        await cleanupFile(filePath);
      }
    }
  },
};
