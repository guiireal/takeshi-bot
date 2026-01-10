/**
 * Desenvolvido por: Dev Gui
 * Implementação dos metadados feita por: MRX
 *
 * @author Dev Gui
 */
import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { createSticker } from "../../services/sticker.js";

export default {
  name: "sticker",
  description: "Cria figurinhas de imagem, gif ou vídeo (máximo 10 segundos).",
  commands: ["f", "s", "sticker", "fig"],
  usage: `${PREFIX}sticker (marque ou responda uma imagem/gif/vídeo)`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async (paramsHandler) => {
    const { isImage, isVideo, sendWaitReact, sendSuccessReact } = paramsHandler;

    if (!isImage && !isVideo) {
      throw new InvalidParameterError(
        `Você precisa marcar ou responder a uma imagem/gif/vídeo!`
      );
    }

    await sendWaitReact();
    await createSticker(paramsHandler);
    await sendSuccessReact();
  },
};
