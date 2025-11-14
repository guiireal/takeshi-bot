/**
 * Desenvolvido por: Mkg
 * Refatorado por: Dev Gui
 *
 * @author Dev Gui
 */
import { BOT_LID, OWNER_LID, PREFIX } from "../../config.js";
import { DangerError } from "../../errors/index.js";
import { checkIfMemberIsMuted, muteMember } from "../../utils/database.js";
import { onlyNumbers } from "../../utils/index.js";

export default {
  name: "mute",
  description:
    "Silencia um usuário no grupo (apaga as mensagens do usuário automáticamente).",
  commands: ["mute", "mutar"],
  usage: `${PREFIX}mute @usuario ou (responda à mensagem do usuário que deseja mutar)`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    args,
    remoteJid,
    replyLid,
    sendErrorReply,
    sendSuccessReply,
    getGroupMetadata,
    isGroup,
  }) => {
    if (!isGroup) {
      throw new DangerError("Este comando só pode ser usado em grupos.");
    }

    if (!args.length && !replyLid) {
      throw new DangerError(
        `Você precisa mencionar um usuário ou responder à mensagem do usuário que deseja mutar.\n\nExemplo: ${PREFIX}mute @fulano`
      );
    }

    const userId = replyLid
      ? replyLid
      : args[0]
      ? `${onlyNumbers(args[0])}@lid`
      : null;

    const targetUserNumber = onlyNumbers(userId);

    if (OWNER_LID && userId === OWNER_LID) {
      throw new DangerError("Você não pode mutar o dono do bot!");
    }

    if (BOT_LID && userId === BOT_LID) {
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
