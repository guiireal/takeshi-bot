import { delay } from "baileys";
import { PREFIX } from "../../../config.js";

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
  description: "Exemplo de como enviar código com formatação do WhatsApp",
  commands: ["enviar-codigo", "codigo"],
  usage: `${PREFIX}enviar-codigo`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendReact }) => {
    await sendReact("💻");

    await delay(2000);

    await sendReply(
      "*Exemplo de código formatado:*\n\n" +
        "```javascript\n" +
        CODE_SAMPLE +
        "\n```\n\n" +
        "No WhatsApp, use três crases (```) para abrir e fechar blocos de código.",
    );

    await delay(2000);

    await sendReply(
      "Também funciona inline com uma crase: `const valor = 1;`",
    );
  },
};
