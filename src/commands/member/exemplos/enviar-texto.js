import { delay } from "zapo-js";
import { PREFIX } from "../../../config.js";

export default {
  name: "enviar-texto",
  description:
    "Exemplo de como enviar mensagens de texto simples e com menções",
  commands: ["enviar-texto"],
  usage: `${PREFIX}enviar-texto`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendText, sendReact, userLid }) => {
    await sendReact("💬");

    await delay(3000);

    await sendReply("Vou demonstrar diferentes formas de enviar texto");

    await delay(3000);

    await sendText("Esta é uma mensagem de texto simples usando sendText");

    await delay(3000);

    await sendText(
      `Olá! Esta mensagem menciona você: @${userLid.split("@")[0]}`,
      [userLid]
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
