const {
  PREFIX,
  BOT_NUMBER,
  OWNER_NUMBER,
  ONWER_LID,
} = require(`${BASE_DIR}/config`);
const { DangerError, InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { toUserJidOrLid, onlyNumbers, toUserJid } = require(`${BASE_DIR}/utils`);

module.exports = {
  name: "ban",
  description: "Removo um membro do grupo",
  commands: ["ban", "kick"],
  usage: `${PREFIX}ban @marcar_membro 
  
ou 

${PREFIX}ban (mencionando uma mensagem)`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    args,
    isReply,
    socket,
    remoteJid,
    replyJid,
    sendReply,
    userJid,
    sendSuccessReact,
    sendErrorReply,
  }) => {
    try {
      if (!args.length && !isReply) {
        throw new InvalidParameterError(
          "Você precisa mencionar ou marcar um membro!"
        );
      }

      const userId = toUserJidOrLid(args[0]);

      const memberToRemoveJid = isReply ? replyJid : userId;
      const memberToRemoveNumber = onlyNumbers(memberToRemoveJid);

      if (!memberToRemoveJid) {
        throw new InvalidParameterError("Membro inválido!");
      }

      if (memberToRemoveJid === userJid) {
        throw new DangerError("Você não pode remover você mesmo!");
      }

      if (
        memberToRemoveNumber === OWNER_NUMBER ||
        memberToRemoveNumber + "@lid" === ONWER_LID
      ) {
        throw new DangerError("Você não pode remover o dono do bot!");
      }

      const botJid = toUserJid(BOT_NUMBER);

      if (memberToRemoveJid === botJid) {
        throw new DangerError("Você não pode me remover!");
      }

      await socket.groupParticipantsUpdate(
        remoteJid,
        [memberToRemoveJid],
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
