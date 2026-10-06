import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { qwen37Flash } from "../../../services/spider-x-api.js";

export default {
  name: "qwen37",
  description: "Use a inteligência artificial Qwen3.7 Flash! (1 request)",
  commands: ["qwen37", "qwen3-7-flash"],
  usage: `${PREFIX}qwen37 Crie um resumo curto sobre inteligência artificial`,
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

    const responseText = await qwen37Flash(prompt);

    await sendSuccessReply(responseText);
  },
};
