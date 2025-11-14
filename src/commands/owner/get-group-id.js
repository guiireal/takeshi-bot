import { PREFIX } from "../../config.js";
import { WarningError } from "../../errors/index.js";

export default {
  name: "get-group-id",
  description: "Retorna o ID completo de um grupo no formato JID.",
  commands: ["get-group-id", "id-get", "id-group"],
  usage: `${PREFIX}get-group-id`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ remoteJid, sendSuccessReply, isGroup }) => {
    if (!isGroup) {
      throw new WarningError("Este comando deve ser usado dentro de um grupo.");
    }

    await sendSuccessReply(`*ID do grupo*: ${remoteJid}`);
  },
};
