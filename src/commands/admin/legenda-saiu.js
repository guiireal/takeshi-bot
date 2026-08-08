import { PREFIX } from "../../config.js";
import { getExitMessage, setExitMessage } from "../../utils/database.js";

export default {
  name: "legenda-saiu",
  description:
    "Define a mensagem de saída do grupo. Use @member para mencionar quem saiu.",
  commands: ["legenda-saiu", "legenda-saida", "set-exit-message", "setexit"],
  usage: `${PREFIX}legendasaiu Poxa, @member saiu do grupo...`,
  handle: async ({ fullArgs, prefix, sendReply, sendSuccessReply }) => {
    const message = fullArgs?.trim();

    if (!message) {
      const current = getExitMessage();

      await sendReply(
        `📨 *Mensagem de saída atual:*

${current}

💡 Para alterar, use:
${prefix}legendasaiu sua mensagem aqui

Variável disponível:
• \`@member\` → menciona o membro que saiu`,
      );
      return;
    }

    setExitMessage(message);

    await sendSuccessReply(
      `Mensagem de saída atualizada!

*Nova mensagem:*
${message}

${
  message.includes("@member")
    ? "✅ `@member` será substituído pela menção de quem sair."
    : "⚠️ Você não usou `@member`. A mensagem não vai mencionar quem sair."
}`,
    );
  },
};
