import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { gemini } from "../../../services/spider-x-api.js";

export default {
  name: "gemini",
  description: "Use a inteligência artificial da Google Gemini!",
  commands: ["gemini", "takeshi"],
  usage: `${PREFIX}gemini com quantos paus se faz uma canoa?`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendSuccessReply, sendWaitReply, args, replyText }) => {
    const text = args[0];

    if (!text && !replyText) {
      throw new InvalidParameterError(
        "Você precisa me dizer o que eu devo responder!"
      );
    }

    await sendWaitReply();

    const prompt =
      text && replyText ? `${text}\n\nComplemento: ${replyText}` : text || replyText;

    const responseText = await gemini(prompt);

    await sendSuccessReply(responseText);
  },
};
