import { PREFIX } from "../../config.js";
import { WarningError } from "../../errors/index.js";
import { deactivateGroup } from "../../utils/database.js";

export default {
  name: "off",
  description: "Desativa o bot no grupo",
  commands: ["off"],
  usage: `${PREFIX}off`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendSuccessReply, remoteJid, isGroup }) => {
    if (!isGroup) {
      throw new WarningError("Este comando deve ser usado dentro de um grupo.");
    }
    deactivateGroup(remoteJid);
    await sendSuccessReply("Bot desativado no grupo!");
  },
};
