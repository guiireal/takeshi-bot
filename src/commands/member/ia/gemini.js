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
  handle: async ({ sendSuccessReply, sendWaitReply, args }) => {
    const text = args[0];

    if (!text) {
      throw new InvalidParameterError(
        "Você precisa me dizer o que eu devo responder!"
      );
    }

    await sendWaitReply();

    const responseText = await gemini(text);

    await sendSuccessReply(responseText);
  },
};
