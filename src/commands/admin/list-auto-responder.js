const { delay } = require("baileys");
const { readMore } = require(`${BASE_DIR}/utils`);
const { listAutoResponderItems } = require(`${BASE_DIR}/utils/database`);

const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "list-auto-responder",
  description: "Lista todos os termos do auto-responder",
  commands: ["list-auto-responder", "list-auto", "list-responder"],
  usage: `${PREFIX}list-auto-responder`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
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
