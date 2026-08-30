import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { gpt56Luna } from "../../../services/spider-x-api.js";

export default {
  name: "gpt56luna",
  description: "Use a inteligência artificial GPT-5.6 Luna! (4 requests)",
  commands: ["gpt56luna", "gpt-5-6-luna"],
  usage: `${PREFIX}gpt56luna Analise os benefícios de uma arquitetura modular`,
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

    const responseText = await gpt56Luna(text);

    await sendSuccessReply(responseText);
  },
};
