import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { addAutoResponderItem } from "../../utils/database.js";

export default {
  name: "add-auto-responder",
  description: "Adiciona um termo no auto-responder",
  commands: ["add-auto-responder", "add-auto", "add-responder"],
  usage: `${PREFIX}add-auto-responder termo / o que eu devo responder`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendSuccessReply, prefix, sendErrorReply, fullArgs }) => {
    const parts = fullArgs.split(/\s\/\s/);

    if (parts.length !== 2) {
      throw new InvalidParameterError(`Você deve informar o termo e a resposta do auto-responder da seguinte forma:

${prefix}add-auto-responder termo / o que eu devo responder`);
    }

    const [term, response] = parts;

    const success = await addAutoResponderItem(term, response);

    if (!success) {
      await sendErrorReply(`O termo "${term}" já existe no auto-responder!`);
      return;
    }

    await sendSuccessReply(
      `O termo "${term}" foi adicionado ao auto-responder com a resposta "${response}".`
    );
  },
};
