import { PREFIX } from "../../../config.js";
import { imageAI } from "../../../services/spider-x-api.js";

export default {
  name: "flux",
  description: "Cria uma imagem usando a IA Flux",
  commands: ["flux"],
  usage: `${PREFIX}flux descrição`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    args,
    sendWaitReply,
    sendWarningReply,
    sendImageFromURL,
    sendSuccessReact,
    fullArgs,
  }) => {
    if (!args[0]) {
      return sendWarningReply(
        "Você precisa fornecer uma descrição para a imagem."
      );
    }

    await sendWaitReply("gerando imagem...");

    const data = await imageAI(fullArgs);

    if (!data?.image) {
      return sendWarningReply(
        "Não foi possível gerar a imagem! Tente novamente mais tarde."
      );
    }

    await sendSuccessReact();
    await sendImageFromURL(data.image);
  },
};
