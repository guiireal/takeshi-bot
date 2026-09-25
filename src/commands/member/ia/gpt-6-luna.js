import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { gpt6Luna } from "../../../services/spider-x-api.js";

export default {
  name: "gpt6luna",
  description: "Use a inteligência artificial GPT-6 Luna! (1 request)",
  commands: ["gpt6luna", "gpt-6-luna"],
  usage: `${PREFIX}gpt6luna Analise os benefícios de uma arquitetura modular`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendSuccessReply, sendWaitReply, args }) => {
    const text = args[0];

    if (!text) {
      throw new InvalidParameterError(
        "Você precisa me dizer o que eu devo responder!",
      );
    }

    await sendWaitReply();

    const responseText = await gpt6Luna(text);
    await sendSuccessReply(responseText);
  },
};
