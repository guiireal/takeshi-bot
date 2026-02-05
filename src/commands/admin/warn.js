import { BOT_LID, OWNER_LID } from "../../config.js";
import { DangerError, InvalidParameterError } from "../../errors/index.js";
import { onlyNumbers } from "../../utils/index.js";
import { errorLog } from "../../utils/logger.js";
import { addWarn, getWarnLimit } from "../../utils/warnSystem.js";

export default {
  name: "warn",
  description: "Aplica advertência a um membro.",
  commands: ["warn", "advertir", "adverter", "advt"],
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    args,
    isReply,
    replyLid,
    remoteJid,
    userLid,
    sendReply,
    sendErrorReply,
    socket,
  }) => {
    try {
      if (!args.length && !isReply) {
        throw new InvalidParameterError(
          "Mencione um usuário ou responda a uma mensagem.",
        );
      }

      if (args.length && !args[0].includes("@")) {
        throw new InvalidParameterError('Use "@" ao mencionar um usuário.');
      }

      const targetLid = isReply ? replyLid : `${onlyNumbers(args[0])}@lid`;

      if (!targetLid) {
        throw new InvalidParameterError("Membro inválido!");
      }

      if (targetLid === userLid) {
        throw new DangerError("Você não pode se advertir!");
      }

      if (targetLid === BOT_LID || targetLid === OWNER_LID) {
        throw new DangerError("Não é possível advertir este usuário.");
      }

      const reason = args.slice(1).join(" ") || "Advertência genérica";
      const newCount = addWarn(remoteJid, targetLid, reason);
      const limit = getWarnLimit(remoteJid);

      await sendReply(
        `⚠️ *@${targetLid.split("@")[0]}* foi advertido!\n` +
          `Motivo: _"${reason}"_\n` +
          `Total: ${newCount}/${limit} advertências`,
        [targetLid],
      );

      if (newCount >= limit) {
        await socket.groupParticipantsUpdate(remoteJid, [targetLid], "remove");

        await sendReply(
          "❌ Limite de advertências atingido. Usuário removido.",
        );
      }
    } catch (error) {
      errorLog(JSON.stringify(error, null, 2));
      await sendErrorReply(`Erro: ${error.message}`);
    }
  },
};
