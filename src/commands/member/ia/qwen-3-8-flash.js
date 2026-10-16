import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { qwen38Flash } from "../../../services/spider-x-api.js";
import { downloadAIImage } from "../../../utils/aiImage.js";

export default {
  name: "qwen38",
  description: "Use a inteligência artificial Qwen3.8 Flash! (2 requests)",
  commands: ["qwen38", "qwen3-8-flash"],
  usage: `${PREFIX}qwen38 Explique como funciona uma API REST

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
        "Você precisa me dizer o que eu devo responder!",
      );
    }

    await sendWaitReply();

    const prompt =
      text && replyText ? `${text}\n\nComplemento: ${replyText}` : text || replyText;

    const image = await downloadAIImage({ isImage, downloadImage, webMessage });
    const responseText = await qwen38Flash(prompt, image);

    await sendSuccessReply(responseText);
  },
};
