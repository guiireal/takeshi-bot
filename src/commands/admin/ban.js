import { BOT_LID, OWNER_LID, PREFIX } from "../../config.js";
import { DangerError, InvalidParameterError } from "../../errors/index.js";
import { onlyNumbers } from "../../utils/index.js";

export default {
  name: "ban",
  description: "Removo um membro do grupo",
  commands: ["ban", "kick"],
  usage: `${PREFIX}ban @marcar_membro 

ou 

${PREFIX}ban (mencionando uma mensagem)`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    args,
    isReply,
    socket,
    remoteJid,
    replyLid,
    sendReply,
    userLid,
    sendSuccessReact,
    sendErrorReply,
  }) => {
    try {
      if (!args.length && !isReply) {
        throw new InvalidParameterError(
          "Você precisa mencionar ou marcar um membro!"
        );
      }

      if (args.length && !args[0].includes("@")) {
        throw new InvalidParameterError(
          'Você precisa mencionar um membro com "@"!'
        );
      }

      const userId = args[0] ? `${onlyNumbers(args[0])}@lid` : null;

      const memberToRemoveLid = isReply ? replyLid : userId;

      if (!memberToRemoveLid) {
        throw new InvalidParameterError("Membro inválido!");
      }

      if (memberToRemoveLid === userLid) {
        throw new DangerError("Você não pode remover você mesmo!");
      }

      const resolvedOwnerLid = OWNER_LID;

      if (resolvedOwnerLid && memberToRemoveLid === resolvedOwnerLid) {
        throw new DangerError("Você não pode remover o dono do bot!");
      }

      if (BOT_LID && memberToRemoveLid === BOT_LID) {
        throw new DangerError("Você não pode me remover!");
      }

      await socket.groupParticipantsUpdate(
        remoteJid,
        [memberToRemoveLid],
        "remove"
      );

      await sendSuccessReact();
      await sendReply("Membro removido com sucesso!");
    } catch (error) {
      console.log(error);
      await sendErrorReply(
        `Ocorreu um erro ao remover o membro: ${error.message}`
      );
    }
  },
};
