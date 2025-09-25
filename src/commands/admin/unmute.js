/**
 * Desenvolvido por: Mkg
 * Refatorado por: Dev Gui
 *
 * @author Dev Gui
 */
const { toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);
const {
  checkIfMemberIsMuted,
  unmuteMember,
} = require(`${BASE_DIR}/utils/database`);
const { PREFIX } = require(`${BASE_DIR}/config`);

const { DangerError, WarningError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "unmute",
  description: "Desativa o mute de um membro do grupo",
  commands: ["unmute", "desmutar"],
  usage: `${PREFIX}unmute @usuario`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ remoteJid, sendSuccessReply, args, isGroup, replyJid }) => {
    if (!isGroup) {
      throw new DangerError("Este comando só pode ser usado em grupos.");
    }

    if (!args.length) {
      throw new DangerError(
        `Você precisa mencionar um usuário para desmutar.\n\nExemplo: ${PREFIX}unmute @fulano`
      );
    }

    const userId = replyJid
      ? replyJid
      : args?.[0]?.length > 14
      ? `${args?.[0]?.replace("@", "")}@lid`
      : args?.[0]?.replace("@", "") + "@s.whatsapp.net";

    if (!checkIfMemberIsMuted(remoteJid, userId)) {
      throw new WarningError("Este usuário não está silenciado!");
    }

    unmuteMember(remoteJid, userId);

    await sendSuccessReply("Usuário desmutado com sucesso!");
  },
};
