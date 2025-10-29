const { PREFIX } = require(`${BASE_DIR}/config`);
const { downloadTiktokVideo, cleanupFile } = require(`${BASE_DIR}/services/tiktokService`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const fs = require("fs");

module.exports = {
  name: "tik-tok",
  description: "Faço o download de vídeos do TikTok",
  commands: ["tik-tok", "ttk"],
  usage: `${PREFIX}tik-tok https://www.tiktok.com/@usuario/video/123456789`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    socket,
    remoteJid,
    webMessage,
    fullArgs,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReply,
  }) => {
    if (!fullArgs.length) {
      throw new InvalidParameterError("Você precisa enviar uma URL do TikTok!");
    }

    await sendWaitReact();

    let filePath = null;

    try {
      // Baixar vídeo do TikTok
      const result = await downloadTiktokVideo(fullArgs);
      filePath = result.filePath;

      // Ler arquivo e enviar como vídeo
      const videoBuffer = fs.readFileSync(filePath);

      await socket.sendMessage(
        remoteJid,
        {
          video: videoBuffer,
          mimetype: "video/mp4",
          caption: `🎬 *TikTok Video*\n\n✅ Download concluído com sucesso!`,
        },
        { quoted: webMessage }
      );

      await sendSuccessReact();
    } catch (error) {
      console.error("[TIKTOK] Erro:", error);
      await sendErrorReply(
        `❌ *Erro ao baixar vídeo do TikTok!*\n\n${error.message}`
      );
    } finally {
      // Limpar arquivo temporário
      if (filePath) {
        cleanupFile(filePath);
        filePath = null;
      }
    }
  },
};
