const fs = require("node:fs");
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { catBoxUpload } = require(`${BASE_DIR}/services/catbox`);
const { getRandomNumber } = require(`${BASE_DIR}/utils`);

module.exports = {
  name: "gerar-link",
  description: "Faço upload da imagens",
  commands: ["to-link", "up", "upload", "gera-link", "gerar-link"],
  usage: `${PREFIX}gerar-link (marque a imagem) ou ${PREFIX}gerar-link (responda a imagem)`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    isImage,
    downloadImage,
    sendSuccessReact,
    sendWaitReact,
    sendReply,
    webMessage,
  }) => {
    if (!isImage) {
      throw new InvalidParameterError(
        "Você deve marcar ou responder uma imagem!"
      );
    }

    await sendWaitReact();

    const filePath = await downloadImage(
      webMessage,
      `${getRandomNumber(10_000, 99_999)}`
    );

    const buffer = fs.readFileSync(filePath);
    const link = await catBoxUpload(buffer);

    await sendSuccessReact();

    await sendReply(`Aqui está o link da sua imagem !\n\n- ${link}`);

    fs.unlinkSync(filePath);
  },
};
