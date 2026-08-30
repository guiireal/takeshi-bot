import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { qwen38Flash } from "../../../services/spider-x-api.js";

export default {
  name: "qwen38",
  description: "Use a inteligência artificial Qwen3.8 Flash! (2 requests)",
  commands: ["qwen38", "qwen3-8-flash"],
  usage: `${PREFIX}qwen38 Explique como funciona uma API REST`,
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

    const responseText = await qwen38Flash(text);

    await sendSuccessReply(responseText);
  },
};
