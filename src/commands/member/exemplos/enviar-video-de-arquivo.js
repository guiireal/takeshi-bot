import { delay } from "zapo-js";
import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../../config.js";

export default {
  name: "enviar-video-de-arquivo",
  description: "Exemplo de como enviar um vídeo a partir de um arquivo local",
  commands: ["enviar-video-de-arquivo"],
  usage: `${PREFIX}enviar-video-de-arquivo`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendVideoFromFile, sendReact }) => {
    await sendReact("🎥");

    await delay(3000);

    await sendReply("Vou enviar um vídeo a partir de um arquivo local");

    await delay(3000);

    await sendVideoFromFile(
      path.join(ASSETS_DIR, "samples", "sample-video.mp4"),
      "Este é um vídeo de exemplo com legenda"
    );

    await delay(3000);

    await sendReply("Você também pode enviar vídeos sem legenda:");

    await delay(3000);

    await sendVideoFromFile(
      path.join(ASSETS_DIR, "samples", "sample-video.mp4")
    );

    await delay(3000);

    await sendReply(
      "Para enviar vídeos de arquivo, use a função sendVideoFromFile(filePath, caption, [mentions], quoted).\n\n" +
        "Isso é útil quando você tem vídeos armazenados localmente no servidor."
    );

    await delay(3000);

    await sendReply(
      "💡 *Dica:* Formatos suportados incluem MP4, AVI, MOV, etc. O WhatsApp converte automaticamente se necessário."
    );
  },
};
