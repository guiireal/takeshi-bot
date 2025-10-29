const { PREFIX } = require("../../config");
const { clearQueue, getQueueInfo } = require("../../services/ytdlpService");

module.exports = {
  name: "limpar-fila",
  description: "Limpa a fila de downloads pendentes do yt-dlp",
  commands: ["limpar-fila", "limparfila", "clearqueue"],
  usage: `${PREFIX}limpar-fila`,
  handle: async ({
    sendSuccessReact,
    sendWaitReact,
    sendErrorReply,
    sendSuccessReply,
    sendWarningReply,
  }) => {
    try {
      await sendWaitReact();
      
      // Obter informações da fila antes de limpar
      const queueInfoBefore = getQueueInfo();
      
      if (queueInfoBefore.queueSize === 0 && !queueInfoBefore.isProcessing) {
        await sendSuccessReact();
        return await sendWarningReply(
          "⚠️ *Fila vazia!*\n\n" +
          "Não há downloads pendentes na fila."
        );
      }
      
      // Limpar a fila
      const removedCount = clearQueue();
      
      await sendSuccessReact();
      await sendSuccessReply(
        "✅ *Fila limpa com sucesso!*\n\n" +
        `📊 *Estatísticas:*\n` +
        `• Downloads removidos: ${removedCount}\n` +
        `• Status: ${queueInfoBefore.isProcessing ? "Processando → Interrompido" : "Vazia"}\n\n` +
        `⚠️ *Nota:* Downloads em andamento foram cancelados.`
      );
    } catch (error) {
      console.error("[LIMPAR-FILA] Erro:", error);
      await sendErrorReply(
        "❌ *Erro ao limpar fila!*\n\n" +
        `Detalhes: ${error.message}`
      );
    }
  },
};
