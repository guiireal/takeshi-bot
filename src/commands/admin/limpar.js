import { delay } from "zapo-js";
import { PREFIX } from "../../config.js";
import { WarningError } from "../../errors/index.js";
import { clearChat } from "../../messages.js";

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
  handle: async ({ isGroup, sendText }) => {
    if (!isGroup) {
      throw new WarningError("Esse comando só pode ser usado em grupos.");
    }

    await sendText(`\n\n${clearChat()}`);

    await delay(2000);

    await sendText("✅ Chat limpo com sucesso!");
  },
};
