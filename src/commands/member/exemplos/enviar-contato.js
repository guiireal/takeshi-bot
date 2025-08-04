const { PREFIX } = require(`${BASE_DIR}/config`);
const { delay } = require("baileys");

module.exports = {
  name: "enviar-contato",
  description: "Exemplo de como enviar um contato",
  commands: ["enviar-contato"],
  usage: `${PREFIX}enviar-contato`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendReact, sendContact }) => {
    await sendReact("📲");

    await delay(3000);

    await sendReply("Vou enviar o contato do meu criador.");

    await delay(3000);

    await sendContact("+55 11 99612-2056", "Dev Gui");

    await delay(3000);

    await sendReply(
      "Use a função `sendContact('+55 99 99999-9999', 'Nome do contato')` para enviar um contato!"
    );
  },
};
