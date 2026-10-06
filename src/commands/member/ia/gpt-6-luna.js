import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { gpt6Luna } from "../../../services/spider-x-api.js";

export default {
  name: "gpt6luna",
  description: "Use a inteligência artificial GPT-6 Luna! (1 request)",
  commands: ["gpt6luna", "gpt"],
  usage: `${PREFIX}gpt6luna Analise os benefícios de uma arquitetura modular`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendSuccessReply, sendWaitReply, args, replyText }) => {
    const text = args[0];

    if (!text && !replyText) {
      throw new InvalidParameterError(
        "Você precisa me dizer o que eu devo responder!",
      );
    }

    await sendWaitReply();

    const prompt =
      text && replyText ? `${text}\n\nComplemento: ${replyText}` : text || replyText;

    const responseText = await gpt6Luna(prompt);
    await sendSuccessReply(responseText);
  },
};
