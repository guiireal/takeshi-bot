import { delay } from "zapo-js";
import { PREFIX } from "../../../config.js";

export default {
  name: "enviar-reacoes",
  description: "Exemplo de diferentes tipos de reações (emojis)",
  commands: ["enviar-reacoes"],
  usage: `${PREFIX}enviar-reacoes`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    sendReply,
    sendReact,
    sendSuccessReact,
    sendErrorReact,
    sendWarningReact,
    sendWaitReact,
  }) => {
    await sendReply("Vou demonstrar diferentes tipos de reações disponíveis:");

    await delay(2000);

    await sendReply("Reação personalizada:");
    await sendReact("🎉");

    await delay(2000);

    await sendReply("Reação de sucesso:");
    await sendSuccessReact();

    await delay(2000);

    await sendReply("Reação de erro:");
    await sendErrorReact();

    await delay(2000);

    await sendReply("Reação de aviso:");
    await sendWarningReact();

    await delay(2000);

    await sendReply("Reação de espera:");
    await sendWaitReact();

    await delay(2000);

    await sendReply("Testando uma sequência de reações:");

    await sendReact("1️⃣");
    await delay(1000);
    await sendReact("2️⃣");
    await delay(1000);
    await sendReact("3️⃣");
    await delay(1000);
    await sendReact("🎯");

    await delay(2000);

    await sendReply(
      "🎭 *Tipos de reação disponíveis:*\n\n" +
        "• `sendReact(emoji)` - Reação personalizada\n" +
        "• `sendSuccessReact()` - Reação de sucesso (✅)\n" +
        "• `sendErrorReact()` - Reação de erro (❌)\n" +
        "• `sendWarningReact()` - Reação de aviso (⚠️)\n" +
        "• `sendWaitReact()` - Reação de espera (⏳)\n\n" +
        "As reações são úteis para dar feedback rápido ao usuário!"
    );
  },
};
