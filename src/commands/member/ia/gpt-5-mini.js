import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { gpt5Mini } from "../../../services/spider-x-api.js";

export default {
  name: "gpt-5-mini",
  description: "Use a inteligência artificial GPT-5 Mini!",
  commands: ["gpt-5-mini", "gpt-5"],
  usage: `${PREFIX}gpt-5-mini qual o sentido da vida?`,
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

    const responseText = await gpt5Mini(prompt);

    await sendSuccessReply(responseText);
  },
};
