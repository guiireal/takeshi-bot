import fs from "node:fs";
import { BOT_EMOJI, PREFIX } from "../../config.js";
import { DangerError, WarningError } from "../../errors/index.js";
import { detectImageMimetype } from "../../services/imageOptimizer.js";
import { takeshiSupport } from "../../services/spider-x-api.js";
import { getRandomName } from "../../utils/index.js";

export default {
  name: "suporte",
  description: "Suporte inteligente do Takeshi usando IA treinada",
  commands: ["suporte", "help", "ajuda"],
  usage: `${PREFIX}suporte como instalar o Takeshi no Termux?

Você também pode enviar uma imagem com o comando ${PREFIX}suporte

Você também pode escrever o texto e responder a mensagem com o comando ${PREFIX}suporte`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    fullArgs,
    args,
    sendReply,
    sendWaitReply,
    sendReact,
    replyText,
    isImage,
    isVideo,
    isAudio,
    downloadImage,
    webMessage,
  }) => {
    if (isVideo) {
      throw new WarningError(
        "Não consigo interpretar vídeos ainda! Envie uma imagem ou texto!",
      );
    }

    if (isAudio) {
      throw new WarningError(
        "Não consigo interpretar áudios ainda! Envie uma imagem ou texto!",
      );
    }

    const doubleContext = args.length && replyText;
    const text = args.length ? fullArgs : replyText;

    if (!text && !isImage) {
      await sendReact(BOT_EMOJI);

      await sendReply(
        `*Takeshi Suporte*
        
Faça sua pergunta sobre mim que eu te ajudarei!
  
📝 *Exemplos*

- ${PREFIX}suporte bot desliga sozinho
- ${PREFIX}suporte como instalar no Termux?
- ${PREFIX}suporte erro 401 API Spider X
- Envie uma imagem com ${PREFIX}suporte para análise visual`,
      );

      return;
    }

    await sendWaitReply("Analisando sua pergunta...");

    const finalText = doubleContext
      ? `Contexto anterior: ${replyText}\n\nNova questão: ${text}`
      : text;

    if (finalText) {
      const minLength = 5;
      const maxLength = 2048;

      if (finalText.length < minLength) {
        throw new DangerError(
          `O texto deve ter no mínimo ${minLength} caracteres.`,
        );
      }

      if (finalText.length > maxLength) {
        throw new DangerError(
          `O texto deve ter no máximo ${maxLength} caracteres.`,
        );
      }
    }

    let imagePath = null;

    try {
      let image = null;

      if (isImage) {
        imagePath = await downloadImage(webMessage, getRandomName());
        const buffer = fs.readFileSync(imagePath);

        if (buffer.length > 5 * 1024 * 1024) {
          throw new DangerError("A imagem deve ter no máximo 5 MB.");
        }

        const mimeType = await detectImageMimetype(buffer, null);

        if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) {
          throw new DangerError("Envie uma imagem JPEG, PNG ou WebP.");
        }

        image = `data:${mimeType};base64,${buffer.toString("base64")}`;
      }

      const answer = await takeshiSupport(
        args.length ? fullArgs : null,
        replyText || null,
        image,
      );

      if (typeof answer !== "string" || !answer.trim()) {
        throw new DangerError(
          `Não consegui encontrar uma resposta para sua pergunta. Tente reformular ou ser mais específico!

Não respondo assuntos fora do meu escopo de tecnologia!`,
        );
      }

      await sendReact(BOT_EMOJI);
      await sendReply(answer);
    } finally {
      if (imagePath && fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
  },
};
