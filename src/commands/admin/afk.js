import { PREFIX } from "../../config.js";
import { DangerError } from "../../errors/index.js";
import { setAfkMember } from "../../utils/database.js";

export default {
  name: "afk",
  description: "Informa que você está ausente e registra o motivo.",
  commands: ["afk", "ausente"],
  usage: `${PREFIX}afk <motivo>`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    fullArgs,
    isGroup,
    remoteJid,
    sendSuccessReply,
    userLid,
  }) => {
    if (!isGroup) {
      throw new DangerError("Este comando só pode ser usado em grupos.");
    }

    const reason = fullArgs.trim() || "não informado";

    setAfkMember(remoteJid, userLid, reason);

    await sendSuccessReply("Ausência cadastrada com sucesso!");
  },
};
