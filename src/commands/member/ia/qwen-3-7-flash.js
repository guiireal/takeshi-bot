import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { qwen37Flash } from "../../../services/spider-x-api.js";
import { downloadAIImage } from "../../../utils/aiImage.js";

export default {
  name: "qwen37",
  description: "Use a inteligência artificial Qwen3.7 Flash! (1 request)",
  commands: ["qwen37", "qwen3-7-flash"],
  usage: `${PREFIX}qwen37 Crie um resumo curto sobre inteligência artificial

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
    const responseText = await qwen37Flash(prompt, image);

    await sendSuccessReply(responseText);
  },
};
