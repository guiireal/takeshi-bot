import { BOT_LID, OWNER_LID } from "../../config.js";
import { DangerError, InvalidParameterError } from "../../errors/index.js";
import { onlyNumbers } from "../../utils/index.js";
import { errorLog } from "../../utils/logger.js";
import { getAllWarns, reactivateWarnByIndex } from "../../utils/warnSystem.js";

export default {
  name: "warn-reactivate",
  description: "Reativa uma advertência inválida.",
  commands: [
    "warn-reactivate",
    "reativarwarn",
    "reativaradvertencia",
    "reativaradvt",
  ],
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    args,
    isReply,
    replyLid,
    remoteJid,
    sendReply,
    sendErrorReply,
  }) => {
    try {
      let targetLid = null;

      if (isReply && replyLid) {
        targetLid = replyLid;
      } else if (args[0]?.includes("@")) {
        targetLid = `${onlyNumbers(args[0])}@lid`;
      } else {
        throw new InvalidParameterError(
          "Mencione um usuário ou responda a uma mensagem.",
        );
      }

      if (!targetLid) {
        throw new InvalidParameterError("Membro inválido!");
      }

      if (targetLid === BOT_LID || targetLid === OWNER_LID) {
        throw new DangerError(
          "Não é possível alterar advertências deste usuário.",
        );
      }

      const action = args[1]?.toLowerCase();
      const allWarns = getAllWarns(remoteJid, targetLid);
      const invalidWarns = allWarns.filter((w) => !w.valid);

      if (invalidWarns.length === 0) {
        return sendReply("Usuário não tem advertências inválidas.");
      }

      if (action === "list") {
        let msg = `📋 *Advertências inválidas de @${targetLid.split("@")[0]}:*\n\n`;
        invalidWarns.forEach((w, i) => {
          const date = new Date(w.timestamp).toLocaleDateString("pt-BR");
          msg += `${i + 1}. "${w.reason}" (${date})\n`;
        });
        return sendReply(msg, [targetLid]);
      }

      if (action && !isNaN(action)) {
        const index = parseInt(action, 10) - 1;
        if (index >= 0 && index < invalidWarns.length) {
          if (reactivateWarnByIndex(remoteJid, targetLid, index)) {
            return sendReply(`✅ Advertência #${index + 1} reativada.`);
          }
        }
      }

      const lastIndex = invalidWarns.length - 1;

      if (reactivateWarnByIndex(remoteJid, targetLid, lastIndex)) {
        await sendReply(`✅ Última advertência inválida reativada.`);
      } else {
        await sendReply("❌ Falha ao reativar advertência.");
      }
    } catch (error) {
      errorLog(JSON.stringify(error, null, 2));
      await sendErrorReply(`Erro: ${error.message}`);
    }
  },
};
