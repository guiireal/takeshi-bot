import { delay } from "baileys";
import { PREFIX } from "../../../config.js";
import { sendRichCodeMessage } from "../../../utils/codeMessage.js";

const CODE_SAMPLE = `async function responderComTempo({ sendReply }) {
  const startedAt = Date.now();

  await sendReply("Processando...");

  return {
    ok: true,
    elapsedMs: Date.now() - startedAt,
  };
}`;

export default {
  name: "enviar-codigo",
  description: "Exemplo de como enviar código em Rich Response",
  commands: ["enviar-codigo", "codigo"],
  usage: `${PREFIX}enviar-codigo`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ socket, remoteJid, webMessage, sendReply, sendReact }) => {
    await sendReact("💻");

    await delay(2000);

    await sendRichCodeMessage(socket, remoteJid, {
      title: "*Exemplo de código em Rich Response*",
      language: "javascript",
      code: CODE_SAMPLE,
      footer:
        "\nEsse tipo usa `AI_RICH_RESPONSE_CODE` dentro de `richResponseMessage`.",
      quoted: webMessage,
    });

    await delay(2000);

    await sendReply(
      "Use `codeMetadata.codeBlocks` quando quiser renderizar um bloco de código como resposta rica.",
    );
  },
};
