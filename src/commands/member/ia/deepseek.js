import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { deepseekV4Flash } from "../../../services/spider-x-api.js";

export default {
  name: "deepseek",
  description: "Use a inteligência artificial DeepSeek V4 Flash!",
  commands: ["deepseek", "deep-seek"],
  usage: `${PREFIX}deepseek Crie um resumo curto sobre inteligência artificial`,
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

    const responseText = await deepseekV4Flash(prompt);

    await sendSuccessReply(responseText);
  },
};
