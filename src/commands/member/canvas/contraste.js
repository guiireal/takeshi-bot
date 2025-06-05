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
  name: "contraste",
  description:
    "Gero uma montagem que ajusta o contraste da imagem que você enviar",
  commands: ["contraste", "contrast", "melhora", "melhorar", "hd", "to-hd"],
  usage: `${PREFIX}contraste (marque a imagem) ou ${PREFIX}contraste (responda a imagem)`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
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
      const outputPath = await ffmpeg.adjustContrast(filePath);
      await sendSuccessReact();
      await sendImageFromFile(outputPath);
    } catch (error) {
      console.error(error);
      throw new Error("Erro ao aplicar efeito de contraste");
    } finally {
      await ffmpeg.cleanup(filePath);
    }
  },
};
