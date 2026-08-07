import { delay } from "zapo-js";
import { PREFIX } from "../../config.js";
import { listAutoResponderItems } from "../../utils/database.js";
import { readMore } from "../../utils/index.js";

export default {
  name: "list-auto-responder",
  description: "Lista todos os termos do auto-responder",
  commands: ["list-auto-responder", "list-auto", "list-responder"],
  usage: `${PREFIX}list-auto-responder`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendSuccessReply, sendWaitReact }) => {
    await sendWaitReact();
    await delay(1000);
    const items = listAutoResponderItems();
    if (items.length === 0) {
      await sendSuccessReply("Não há termos cadastrados no auto-responder.");
      return;
    }
    let message = `*📋 Lista do auto-responder*\n\n${readMore()}`;
    items.forEach((item) => {
      message += `${item.key}. ${item.match}\n`;
      message += `   ↳ "${item.answer}"\n\n`;
    });
    message += `_Total: ${items.length} termo(s) cadastrado(s)_`;
    await sendSuccessReply(message);
  },
};
