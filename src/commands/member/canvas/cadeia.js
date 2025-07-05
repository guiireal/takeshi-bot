const fs = require("node:fs");
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { upload } = require(`${BASE_DIR}/services/upload`);
const { canvas } = require(`${BASE_DIR}/services/spider-x-api`);
const { getRandomNumber } = require(`${BASE_DIR}/utils`);

module.exports = {
  name: "cadeia",
  description:
    "Gero uma montagem como se a pessoa estivesse na cadeia com a imagem que você enviar",
  commands: ["cadeia", "jail"],
  usage: `${PREFIX}cadeia (marque a imagem) ou ${PREFIX}cadeia (responda a imagem)`,
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

    const fileName = getRandomNumber(10_000, 99_999).toString();
    const filePath = await downloadImage(webMessage, fileName);

    const buffer = fs.readFileSync(filePath);
    const link = await upload(buffer, `${fileName}.png`);

    if (!link) {
      throw new DangerError(
        "Não consegui fazer o upload da imagem, tente novamente mais tarde!"
      );
    }

    const url = canvas("jail", link);

    await sendSuccessReact();

    await sendImageFromURL(url, "Imagem gerada!");

    fs.unlinkSync(filePath);
  },
};
