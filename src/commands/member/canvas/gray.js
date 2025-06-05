/**
 * Desenvolvido por: MRX
 * Refatorado por: Dev Gui
 *
 * @author Dev Gui
 */
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const Ffmpeg = require(`${BASE_DIR}/services/ffmpeg`);

module.exports = {
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
