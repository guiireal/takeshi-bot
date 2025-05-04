const { PREFIX } = require(`${BASE_DIR}/config`);
const {
  InvalidParameterError,
} = require(`${BASE_DIR}/errors/InvalidParameterError`);
const { DangerError } = require(`${BASE_DIR}/errors/DangerError`);
const fs = require("fs");
const { canvas } = require(`${BASE_DIR}/services/spider-x-api`);
const { catBoxUpload } = require(`${BASE_DIR}/services/catbox`);
const { getRandomNumber } = require(`${BASE_DIR}/utils`);

module.exports = {
  name: "bolsonaro",
  description: "Gero uma montagem do Bolsonaro com a imagem que você enviar",
  commands: ["bolsonaro"],
  usage: `${PREFIX}bolsonaro (marque a imagem) ou ${PREFIX}bolsonaro (responda a imagem)`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    isImage,
    downloadImage,
    sendSuccessReact,
    sendWaitReact,
    sendImageFromURL,
    webMessage,
  }) => {
    if (!isImage) {
      throw new InvalidParameterError(
        "Você precisa marcar uma imagem ou responder a uma imagem"
      );
    }

    await sendWaitReact();

    const filePath = await downloadImage(
      webMessage,
      `${getRandomNumber(10_000, 99_999)}`
    );

    const buffer = fs.readFileSync(filePath);
    const link = await catBoxUpload(buffer);

    if (!link) {
      throw new DangerError(
        "Não consegui fazer o upload da imagem, tente novamente mais tarde!"
      );
    }

    const url = canvas("bolsonaro", link);

    await sendSuccessReact();

    await sendImageFromURL(url, "Imagem gerada!");

    fs.unlinkSync(filePath);
  },
};
