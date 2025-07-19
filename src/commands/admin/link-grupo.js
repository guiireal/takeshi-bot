/**
 * Comando para obter o link do grupo
 *
 * @author Valéria
 */
const { errorLog } = require(`${BASE_DIR}/utils/logger`);
const { PREFIX } = require(`${BASE_DIR}/config`);
const { DangerError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "link-grupo",
  description: "Obtém o link do grupo",
  commands: ["link-grupo", "link-gp"],
  usage: `${PREFIX}link-grupo`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    socket,
    sendReact,
    sendReply,
    sendErrorReply,
    remoteJid,
  }) => {
    try {
      const groupCode = await socket.groupInviteCode(remoteJid);

      if (!groupCode) {
        throw new DangerError("Preciso ser admin!");
      }

      const groupInviteLink = `https://chat.whatsapp.com/${groupCode}`;

      await sendReact("🪀");
      await sendReply(groupInviteLink);
    } catch (error) {
      errorLog(error);
      await sendErrorReply("Preciso ser admin!");
    }
  },
};
