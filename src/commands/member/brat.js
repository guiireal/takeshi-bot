import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { brat } from "../../services/spider-x-api.js";

export default {
  name: "brat",
  description: "Gera imagem no estilo brat com o texto informado.",
  commands: ["brat"],
  usage: `${PREFIX}brat Nem judas mentiu tanto assim ☠️`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    sendWaitReact,
    fullArgs,
    sendImageFromURL,
    sendSuccessReact,
    sendErrorReply,
  }) => {
    if (!fullArgs.length) {
      throw new InvalidParameterError(
        "Você precisa informar o texto que deseja transformar em imagem.",
      );
    }

    await sendWaitReact();

    const url = await brat(fullArgs.trim());

    const response = await fetch(url);

    if (!response.ok) {
      const data = await response.json();

      await sendErrorReply(
        `Ocorreu um erro ao executar uma chamada remota para a Spider X API no comando brat!\n      \n📄 *Detalhes*: ${data.message}`,
      );
      return;
    }

    await sendSuccessReact();

    await sendImageFromURL(url, "Imagem gerada no estilo brat ✅");
  },
};
