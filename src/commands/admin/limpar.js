import { PREFIX } from "../../config.js";
import { WarningError } from "../../errors/index.js";
import { sendCleanChat } from "../../utils/cleanChat.js";

export default {
  name: "limpar-chat",
  description: "Limpa o histórico de mensagens do grupo.",
  commands: [
    "limpar-chat",
    "clean-chat",
    "clean",
    "clear-chat",
    "clear",
    "lc",
    "limpa-chat",
    "limpa",
    "limpar",
  ],
  usage: `${PREFIX}limpar-chat`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    socket,
    remoteJid,
    isGroup,
    sendSuccessReply,
    sendText,
  }) => {
    if (!isGroup) {
      throw new WarningError("Esse comando só pode ser usado em grupos.");
    }

    await sendCleanChat({
      socket,
      remoteJid,
      sendText,
      sendSuccessReply,
      successMessage: "Chat limpo com sucesso!",
    });
  },
};
