const { PREFIX } = require(`${BASE_DIR}/config`);
const { delay } = require("baileys");

module.exports = {
  name: "enviar-texto",
  description:
    "Exemplo de como enviar mensagens de texto simples e com menções",
  commands: ["enviar-texto"],
  usage: `${PREFIX}enviar-texto`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendText, sendReact, userJid }) => {
    await sendReact("💬");

    await delay(3000);

    await sendReply("Vou demonstrar diferentes formas de enviar texto");

    await delay(3000);

    await sendText("Esta é uma mensagem de texto simples usando sendText");

    await delay(3000);

    await sendText(
      `Olá! Esta mensagem menciona você: @${userJid.split("@")[0]}`,
      [userJid]
    );

    await delay(3000);

    await sendReply("Esta é uma resposta usando sendReply");

    await delay(3000);

    await sendText(
      "Você pode usar *negrito*, _itálico_, ~riscado~ e ```código``` no texto!"
    );

    await delay(3000);

    await sendText(
      "📝 *Diferenças entre as funções:*\n\n" +
        "• `sendText()` - Envia texto simples, com opção de mencionar usuários\n" +
        "• `sendReply()` - Envia texto como resposta à mensagem atual\n\n" +
        "Ambas suportam formatação do WhatsApp!"
    );
  },
};
