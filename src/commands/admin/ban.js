const { OWNER_NUMBER } = require("../../config");

const { PREFIX, BOT_NUMBER } = require(`${BASE_DIR}/config`);
const { DangerError, InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);

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
  }) => {
    if (!args.length && !isReply) {
      throw new InvalidParameterError(
        "Você precisa mencionar ou marcar um membro!"
      );
    }

    const userId =
      args?.[0]?.length > 14
        ? `${args?.[0]?.replace("@", "")}@lid`
        : args?.[0]?.replace("@", "") + "@s.whatsapp.net";

    let memberToRemoveId = null;

    const memberToRemoveJid = isReply ? replyJid : userId;
    const memberToRemoveNumber = onlyNumbers(memberToRemoveJid);

    if (memberToRemoveJid === userJid) {
      throw new DangerError("Você não pode remover você mesmo!");
    }

    if (memberToRemoveNumber === OWNER_NUMBER) {
      throw new DangerError("Você não pode remover o dono do bot!");
    }

    const botJid = toUserJid(BOT_NUMBER);

    if (memberToRemoveJid === botJid) {
      throw new DangerError("Você não pode me remover!");
    }

    memberToRemoveId = memberToRemoveJid;

    await socket.groupParticipantsUpdate(
      remoteJid,
      [memberToRemoveId],
      "remove"
    );

    await sendSuccessReact();

    await sendReply("Membro removido com sucesso!");
  },
};
