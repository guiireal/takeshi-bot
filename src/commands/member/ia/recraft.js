import { PREFIX } from "../../../config.js";
import { recraftV41Flash } from "../../../services/spider-x-api.js";

export default {
  name: "recraft",
  description: "Cria uma imagem usando a IA Recraft V4.1 Flash (18 requests)",
  commands: ["recraft", "recraft-v4-1-flash"],
  usage: `${PREFIX}recraft descrição`,
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
        "Você precisa fornecer uma descrição para a imagem.",
      );
    }

    await sendWaitReply("gerando imagem...");

    const data = await recraftV41Flash(fullArgs);

    if (!data?.image) {
      return sendWarningReply(
        "Não foi possível gerar a imagem! Tente novamente mais tarde.",
      );
    }

    await sendSuccessReact();
    await sendImageFromURL(data.image);
  },
};
