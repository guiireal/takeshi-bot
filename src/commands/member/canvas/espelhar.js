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
  name: "espelhar",
  description: "Inverto a posição da imagem que você enviar",
  commands: ["espelhar", "muda-direcao", "mudar-direcao", "mirror"],
  usage: `${PREFIX}espelhar (marque a imagem) ou ${PREFIX}espelhar (responda a imagem)`,
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
      const outputPath = await ffmpeg.mirrorImage(filePath);
      await sendSuccessReact();
      await sendImageFromFile(outputPath);
    } catch (error) {
      console.error(error);
      throw new Error("Erro ao aplicar efeito de espelhamento");
    } finally {
      await ffmpeg.cleanup(filePath);
    }
  },
};
