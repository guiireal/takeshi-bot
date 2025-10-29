const { PREFIX } = require(`${BASE_DIR}/config`);
const { searchAndDownload, cleanupFile } = require(`${BASE_DIR}/services/ytdlpService`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "play-audio",
  description: "Faço o download de músicas",
  commands: ["play-audio", "play", "pa"],
  usage: `${PREFIX}play-audio MC Hariel`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    socket,
    remoteJid,
    webMessage,
    sendImageFromURL,
    sendAudioFromFile,
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
        `Você não pode usar links para baixar músicas! Use ${PREFIX}yt-mp3 link`
      );
    }

    await sendWaitReact();

    let filePath = null;

    try {
      const { filePath: downloadedFile, info } = await searchAndDownload("audio", fullArgs);
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

      // Enviar áudio diretamente (MP3 do yt-dlp já está no formato correto)
      const audioBuffer = fs.readFileSync(filePath);
      await socket.sendMessage(
        remoteJid,
        {
          audio: audioBuffer,
          mimetype: "audio/mpeg",
          ptt: false,
        },
        { quoted: webMessage }
      );

      // Limpar arquivo temporário após o envio
      await cleanupFile(filePath);
      filePath = null;
    } catch (error) {
      console.error(error);
      await sendErrorReply(
        error.message || "Erro desconhecido durante o download do áudio!"
      );
    } finally {
      // Limpar arquivo temporário apenas se ainda não foi limpo
      if (filePath) {
        await cleanupFile(filePath);
      }
    }
  },
};
