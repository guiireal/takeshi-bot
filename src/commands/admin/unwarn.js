// src/commands/admin/unwarn.js
import { BOT_LID, OWNER_LID } from "../../config.js";
import { DangerError, InvalidParameterError } from "../../errors/index.js";
import { onlyNumbers } from "../../utils/index.js";
import {
  ADVT_getAllWarns,
  ADVT_removeLastValidWarn,
  ADVT_revokeWarnByIndex,
} from "../../utils/ADVT_warnSystem.js";
import { errorLog } from "../../utils/logger.js";

export default {
  name: "unwarn",
  description: "Remove ou lista advertências válidas.",
  commands: ["unwarn", "perdoaradvertência", "perdoaradvt", "removeradvertencia", "advtremove"],
  handle: async ({
    args,
    isReply,
    replyLid,
    remoteJid,
    userLid,
    sendReply,
    sendErrorReply,
  }) => {
    try {
      if (!args.length && !isReply) {
        throw new InvalidParameterError("Mencione um usuário ou responda a uma mensagem.");
      }
      if (args.length && !args[0].includes("@")) {
        throw new InvalidParameterError('Use "@" ao mencionar um usuário.');
      }

      const targetLid = isReply ? replyLid : `${onlyNumbers(args[0])}@lid`;
      if (!targetLid) throw new InvalidParameterError("Membro inválido!");
      if (targetLid === BOT_LID || targetLid === OWNER_LID) {
        throw new DangerError("Não é possível alterar advertências deste usuário.");
      }

      const action = args[1]?.toLowerCase();
      const allWarns = ADVT_getAllWarns(remoteJid, targetLid);
      const validWarns = allWarns.filter(w => w.valid);

      if (validWarns.length === 0) {
        return sendReply("Usuário não tem advertências válidas.");
      }

      if (action === "list") {
        let msg = `📋 *Advertências válidas de @${targetLid.split("@")[0]}:*\n\n`;
        validWarns.forEach((w, i) => {
          const date = new Date(w.timestamp).toLocaleDateString("pt-BR");
          msg += `${i + 1}. "${w.reason}" (${date})\n`;
        });
        return sendReply(msg);
      }

      if (action && !isNaN(action)) {
        const index = parseInt(action, 10) - 1;
        if (index >= 0 && index < validWarns.length) {
          ADVT_revokeWarnByIndex(remoteJid, targetLid, index);
          return sendReply(`✅ Advertência #${index + 1} removida.`);
        }
      }

      ADVT_removeLastValidWarn(remoteJid, targetLid);
      await sendReply(`✅ Última advertência removida.`);
    } catch (error) {
      errorLog(JSON.stringify(error, null, 2));
      await sendErrorReply(`Erro: ${error.message}`);
    }
  },
};