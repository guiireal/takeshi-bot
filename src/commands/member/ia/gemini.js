import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { gemini } from "../../../services/spider-x-api.js";
import { downloadAIImage } from "../../../utils/aiImage.js";

export default {
  name: "gemini",
  description: "Use a inteligência artificial da Google Gemini!",
  commands: ["gemini", "takeshi"],
  usage: `${PREFIX}gemini com quantos paus se faz uma canoa?

Você também pode enviar uma imagem com a pergunta na legenda.`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    sendSuccessReply,
    sendWaitReply,
    args,
    replyText,
    isImage,
    downloadImage,
    webMessage,
  }) => {
    const text = args[0];

    if (!text && !replyText) {
      throw new InvalidParameterError(
        "Você precisa me dizer o que eu devo responder!"
      );
    }

    await sendWaitReply();

    const prompt =
      text && replyText ? `${text}\n\nComplemento: ${replyText}` : text || replyText;

    const image = await downloadAIImage({ isImage, downloadImage, webMessage });
    const responseText = await gemini(prompt, image);

    await sendSuccessReply(responseText);
  },
};
