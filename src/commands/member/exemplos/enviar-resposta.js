import { delay } from "baileys";
import { PREFIX } from "../../../config.js";

export default {
  name: "enviar-resposta",
  description:
    "Exemplo de diferentes tipos de respostas (sucesso, erro, aviso, espera)",
  commands: ["enviar-resposta"],
  usage: `${PREFIX}enviar-resposta`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    sendReply,
    sendSuccessReply,
    sendErrorReply,
    sendWarningReply,
    sendWaitReply,
    sendReact,
  }) => {
    await sendReact("💬");

    await delay(3000);

    await sendReply(
      "Vou demonstrar diferentes tipos de respostas disponíveis:"
    );

    await delay(3000);

    await sendSuccessReply("Esta é uma mensagem de sucesso! ✅");

    await delay(3000);

    await sendErrorReply("Esta é uma mensagem de erro! ❌");

    await delay(3000);

    await sendWarningReply("Esta é uma mensagem de aviso! ⚠️");

    await delay(3000);

    await sendWaitReply("Esta é uma mensagem de espera! ⏳");

    await delay(3000);

    await sendReply("E esta é uma resposta normal usando sendReply");

    await delay(3000);

    await sendReply(
      "📋 *Tipos de resposta disponíveis:*\n\n" +
        "• `sendReply()` - Resposta normal\n" +
        "• `sendSuccessReply()` - Resposta de sucesso (com ✅)\n" +
        "• `sendErrorReply()` - Resposta de erro (com ❌)\n" +
        "• `sendWarningReply()` - Resposta de aviso (com ⚠️)\n" +
        "• `sendWaitReply()` - Resposta de espera (com ⏳)\n\n" +
        "Use cada uma conforme o contexto apropriado!"
    );
  },
};
