import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { gpt5Mini } from "../../../services/spider-x-api.js";

export default {
  name: "gpt-5-mini",
  description: "Use a inteligência artificial GPT-5 Mini!",
  commands: ["gpt-5-mini", "gpt-5", "gpt"],
  usage: `${PREFIX}gpt-5-mini qual o sentido da vida?`,
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

    const responseText = await gpt5Mini(text);

    await sendSuccessReply(responseText);
  },
};
