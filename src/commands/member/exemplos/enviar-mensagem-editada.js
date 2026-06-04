import { delay } from "baileys";
import { PREFIX } from "../../../config.js";
import { sendRichCodeMessage } from "../../../utils/codeMessage.js";

export default {
  name: "enviar-mensagem-editada",
  description: "Exemplo de como enviar uma mensagem editada",
  commands: ["enviar-mensagem-editada"],
  usage: `${PREFIX}enviar-mensagem-editada"],`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    sendReact,
    sendReply,
    sendText,
    sendEditedReply,
    sendEditedText,
    socket,
    remoteJid,
    webMessage,
  }) => {
    await sendReact("✏️");

    await delay(3000);

    await sendReply(
      "Vou demonstrar como enviar uma mensagem de texto e depois editar ela.",
    );

    await delay(3000);

    const messageTextResponse = await sendText("Esta é a mensagem original.");

    await delay(3000);

    await sendEditedText("Esta é a mensagem editada. ✅", messageTextResponse);

    await delay(3000);

    await sendReply(
      "Agora vou enviar uma mensagem de texto em cima da sua e editar ela.",
    );

    await delay(3000);

    const messageEditedResponse = await sendReply(
      "Esta é a mensagem original.",
    );

    await delay(3000);

    await sendEditedReply(
      "Esta é a mensagem editada. ✅",
      messageEditedResponse,
    );

    await delay(3000);

    await sendRichCodeMessage(socket, remoteJid, {
      title: "*Exemplo prático*",
      language: "javascript",
      code: `\nconst messageTextResponse = await sendText("Esta é a mensagem original.");

await sendEditedText("Esta é a mensagem editada. ✅", messageTextResponse);`,
      quoted: webMessage,
    });
  },
};
