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
  name: "blur",
  description: "Gero uma montagem que embaça a imagem que você enviar",
  commands: ["blur", "embaça", "embaçar"],
  usage: `${PREFIX}blur (marque a imagem) ou ${PREFIX}blur (responda a imagem)`,
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
      const outputPath = await ffmpeg.applyBlur(filePath);
      await sendSuccessReact();
      await sendImageFromFile(outputPath);
    } catch (error) {
      console.error(error);
      throw new Error("Erro ao aplicar efeito de blur");
    } finally {
      await ffmpeg.cleanup(filePath);
    }
  },
};
