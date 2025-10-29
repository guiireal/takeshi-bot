const { PREFIX, YTDLP_DEFAULT_VIDEO_QUALITY } = require(`${BASE_DIR}/config`);
const { searchAndDownload, cleanupFile } = require(`${BASE_DIR}/services/ytdlpService`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const fs = require("fs");

module.exports = {
  name: "play-video",
  description: "Faço o download de vídeos",
  commands: ["play-video", "pv"],
  usage: `${PREFIX}play-video MC Hariel`,
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
        "Você precisa me dizer o que deseja buscar!"
      );
    }

    if (fullArgs.includes("http://") || fullArgs.includes("https://")) {
      throw new InvalidParameterError(
        `Você não pode usar links para baixar vídeos! Use ${PREFIX}yt-mp4 link`
      );
    }

    await sendWaitReact();

    let filePath = null;

    try {
      const { filePath: downloadedFile, info } = await searchAndDownload(
        "video", 
        fullArgs, 
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
