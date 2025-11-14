/**
 * Desenvolvido por: MRX
 * Refatorado por: Dev Gui
 *
 * @author Dev Gui
 */
import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { Ffmpeg } from "../../../services/ffmpeg.js";

export default {
  name: "gray",
  description:
    "Gero uma montagem que converte a imagem que você enviar para preto e branco",
  commands: ["gray", "preto-e-branco", "pb"],
  usage: `${PREFIX}gray (marque a imagem) ou ${PREFIX}gray (responda a imagem)`,
  handle: async ({
    isImage,
    downloadImage,
    sendSuccessReact,
    sendWaitReact,
    sendImageFromFile,
    webMessage,
  }) => {
    if (!isImage) {
      throw new InvalidParameterError(
        "Você precisa marcar uma imagem ou responder a uma imagem"
      );
    }

    await sendWaitReact();
    const filePath = await downloadImage(webMessage);
    const ffmpeg = new Ffmpeg();

    try {
      const outputPath = await ffmpeg.convertToGrayscale(filePath);
      await sendSuccessReact();
      await sendImageFromFile(outputPath);
    } catch (error) {
      console.error(error);
      throw new Error("Erro ao aplicar efeito preto e branco");
    } finally {
      await ffmpeg.cleanup(filePath);
    }
  },
};
