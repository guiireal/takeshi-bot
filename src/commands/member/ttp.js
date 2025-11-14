import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { ttp } from "../../services/spider-x-api.js";

export default {
  name: "ttp",
  description: "Faz figurinhas de texto.",
  commands: ["ttp"],
  usage: `${PREFIX}ttp teste`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    sendWaitReact,
    args,
    sendStickerFromURL,
    sendSuccessReact,
  }) => {
    if (!args.length) {
      throw new InvalidParameterError(
        "Você precisa informar o texto que deseja transformar em figurinha."
      );
    }

    await sendWaitReact();

    const url = await ttp(args[0].trim());

    const response = await fetch(url);

    if (!response.ok) {
      const data = await response.json();

      await sendErrorReply(
        `Ocorreu um erro ao executar uma chamada remota para a Spider X API no comando ttp!
      
📄 *Detalhes*: ${data.message}`
      );
      return;
    }

    await sendSuccessReact();

    await sendStickerFromURL(url);
  },
};
