/**
 * Comando para obter o link do grupo
 *
 * @author Valéria
 */
import { PREFIX } from "../../config.js";
import { DangerError } from "../../errors/index.js";
import { errorLog } from "../../utils/logger.js";

export default {
  name: "link-grupo",
  description: "Obtém o link do grupo",
  commands: ["link-grupo", "link-gp"],
  usage: `${PREFIX}link-grupo`,
  /**
   * @param {CommandHandleProps} props
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
