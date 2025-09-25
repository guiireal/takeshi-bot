/**
 * Desenvolvido por: Mkg
 * Refatorado por: Dev Gui
 *
 * @author Dev Gui
 */
const { toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);
const {
  checkIfMemberIsMuted,
  muteMember,
} = require(`${BASE_DIR}/utils/database`);
const {
  PREFIX,
  BOT_NUMBER,
  OWNER_NUMBER,
  OWNER_LID,
} = require(`${BASE_DIR}/config`);

const { DangerError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "mute",
  description:
    "Silencia um usuário no grupo (apaga as mensagens do usuário automáticamente).",
  commands: ["mute", "mutar"],
  usage: `${PREFIX}mute @usuario ou (responda à mensagem do usuário que deseja mutar)`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    args,
    remoteJid,
    replyJid,
    userJid,
    sendErrorReply,
    sendSuccessReply,
    getGroupMetadata,
    isGroup,
  }) => {
    if (!isGroup) {
      throw new DangerError("Este comando só pode ser usado em grupos.");
    }

    if (!args.length && !replyJid) {
      throw new DangerError(
        `Você precisa mencionar um usuário ou responder à mensagem do usuário que deseja mutar.\n\nExemplo: ${PREFIX}mute @fulano`
      );
    }

    const userId = replyJid
      ? replyJid
      : args?.[0]?.length > 14
      ? `${args?.[0]?.replace("@", "")}@lid`
      : args?.[0]?.replace("@", "") + "@s.whatsapp.net";

    const targetUserNumber = onlyNumbers(userId);

    if (
      [OWNER_NUMBER, OWNER_LID.replace("@lid", "")].includes(targetUserNumber)
    ) {
      throw new DangerError("Você não pode mutar o dono do bot!");
    }

    if (userId === toUserJid(BOT_NUMBER)) {
      throw new DangerError("Você não pode mutar o bot.");
    }

    const groupMetadata = await getGroupMetadata();

    const isUserInGroup = groupMetadata.participants.some(
      (participant) => participant.id === userId
    );

    if (!isUserInGroup) {
      return sendErrorReply(
        `O usuário @${targetUserNumber} não está neste grupo.`,
        [userId]
      );
    }

    const isTargetAdmin = groupMetadata.participants.some(
      (participant) => participant.id === userId && participant.admin
    );

    if (isTargetAdmin) {
      throw new DangerError("Você não pode mutar um administrador.");
    }

    if (checkIfMemberIsMuted(remoteJid, userId)) {
      return sendErrorReply(
        `O usuário @${targetUserNumber} já está silenciado neste grupo.`,
        [userId]
      );
    }

    muteMember(remoteJid, userId);

    await sendSuccessReply(
      `@${targetUserNumber} foi mutado com sucesso neste grupo!`,
      [userId]
    );
  },
};
