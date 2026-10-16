import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { claudeHaiku55 } from "../../../services/spider-x-api.js";
import { downloadAIImage } from "../../../utils/aiImage.js";

export default {
  name: "claude-haiku-5-5",
  description: "Use a inteligência artificial Claude Haiku 5.5!",
  commands: ["claude", "haiku", "claudehaiku"],
  usage: `${PREFIX}claude Analise os benefícios de uma arquitetura modular

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
      text && replyText
        ? `${text}\n\nComplemento: ${replyText}`
        : text || replyText;

    const image = await downloadAIImage({ isImage, downloadImage, webMessage });
    const responseText = await claudeHaiku55(prompt, image);
    await sendSuccessReply(responseText);
  },
};
