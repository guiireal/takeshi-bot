const { PREFIX } = require("../../config");
const { getQueueInfo } = require("../../services/ytdlpService");

module.exports = {
  name: "fila",
  description: "Mostra informações sobre a fila de downloads do yt-dlp",
  commands: ["fila", "queue", "fila-status"],
  usage: `${PREFIX}fila`,
  handle: async ({
    sendSuccessReact,
    sendWaitReact,
    sendErrorReply,
    sendReply,
  }) => {
    try {
      await sendWaitReact();
      
      const queueInfo = getQueueInfo();
      
      let statusEmoji = "✅";
      let statusText = "Vazia";
      
      if (queueInfo.isProcessing) {
        statusEmoji = "⏳";
        statusText = "Processando";
      } else if (queueInfo.queueSize > 0) {
        statusEmoji = "📥";
        statusText = "Aguardando";
      }
      
      await sendSuccessReact();
      await sendReply(
        `${statusEmoji} *Status da Fila de Downloads*\n\n` +
        `📊 *Informações:*\n` +
        `• Status: ${statusText}\n` +
        `• Downloads na fila: ${queueInfo.queueSize}\n` +
        `• Processando agora: ${queueInfo.isProcessing ? "Sim" : "Não"}\n\n` +
        `💡 *Dica:* Use \`${PREFIX}limpar-fila\` para limpar downloads pendentes.`
      );
    } catch (error) {
      console.error("[FILA] Erro:", error);
      await sendErrorReply(
        "❌ *Erro ao verificar fila!*\n\n" +
        `Detalhes: ${error.message}`
      );
    }
  },
};
