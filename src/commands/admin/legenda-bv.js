import { PREFIX } from "../../config.js";
import { getWelcomeMessage, setWelcomeMessage } from "../../utils/database.js";

export default {
  name: "legenda-bv",
  description:
    "Define a mensagem de boas-vindas do grupo. Use @member para mencionar quem entrou.",
  commands: [
    "legenda-bv",
    "legenda-bemvindo",
    "set-welcome-message",
    "setwelcome",
  ],
  usage: `${PREFIX}legendabv Seja bem vindo(a), @member!`,
  handle: async ({ fullArgs, prefix, sendReply, sendSuccessReply }) => {
    const message = fullArgs?.trim();

    if (!message) {
      const current = getWelcomeMessage();

      await sendReply(
        `📨 *Mensagem de boas-vindas atual:*

${current}

💡 Para alterar, use:
${prefix}legendabv sua mensagem aqui

Variável disponível:
• \`@member\` → menciona o membro que entrou`,
      );
      return;
    }

    setWelcomeMessage(message);

    await sendSuccessReply(
      `Mensagem de boas-vindas atualizada!

*Nova mensagem:*
${message}

${
  message.includes("@member")
    ? "✅ `@member` será substituído pela menção de quem entrar."
    : "⚠️ Você não usou `@member`. A mensagem não vai mencionar quem entrar."
}`,
    );
  },
};
