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
  handle: async ({
    remoteJid,
    sendSuccessReply,
    args,
    isGroup,
    isGroupWithLid,
    socket,
  }) => {
    if (!isGroup) {
      throw new DangerError("Este comando só pode ser usado em grupos.");
    }

    if (!args.length) {
      throw new DangerError(
        `Você precisa mencionar um usuário para desmutar.\n\nExemplo: ${PREFIX}unmute @fulano`
      );
    }

    const targetUserNumber = onlyNumbers(args[0]);
    let targetUserJid = toUserJid(targetUserNumber);

    if (isGroupWithLid) {
      const [result] = await socket.onWhatsApp(targetUserNumber);
      targetUserJid = result?.lid;
    }

    if (!checkIfMemberIsMuted(remoteJid, targetUserJid)) {
      throw new WarningError("Este usuário não está silenciado!");
    }

    unmuteMember(remoteJid, targetUserJid);

    await sendSuccessReply("Usuário desmutado com sucesso!");
  },
};
