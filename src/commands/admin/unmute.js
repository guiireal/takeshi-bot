/**
 * Desenvolvido por: Mkg
 * Refatorado por: Dev Gui
 *
 * @author Dev Gui
 */
import { PREFIX } from "../../config.js";
import { DangerError, WarningError } from "../../errors/index.js";
import { checkIfMemberIsMuted, unmuteMember } from "../../utils/database.js";

export default {
  name: "unmute",
  description: "Desativa o mute de um membro do grupo",
  commands: ["unmute", "desmutar"],
  usage: `${PREFIX}unmute @usuario`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ remoteJid, sendSuccessReply, args, isGroup, replyLid }) => {
    if (!isGroup) {
      throw new DangerError("Este comando só pode ser usado em grupos.");
    }
    if (!args.length) {
      throw new DangerError(
        `Você precisa mencionar um usuário para desmutar.\n\nExemplo: ${PREFIX}unmute @fulano`
      );
    }
    const userId = replyLid
      ? replyLid
      : args[0]
      ? `${args[0].replace(/[^0-9]/g, "")}@lid`
      : null;
    if (!checkIfMemberIsMuted(remoteJid, userId)) {
      throw new WarningError("Este usuário não está silenciado!");
    }
    unmuteMember(remoteJid, userId);
    await sendSuccessReply("Usuário desmutado com sucesso!");
  },
};
