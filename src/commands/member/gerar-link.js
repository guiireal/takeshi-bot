const fs = require("node:fs");
const { upload } = require(`${BASE_DIR}/services/upload`);
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
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

    const fileName = getRandomNumber(10_000, 99_999).toString();
    const filePath = await downloadImage(webMessage, fileName);

    const buffer = fs.readFileSync(filePath);

    const link = await upload(buffer, `${fileName}.png`);

    if (!link) {
      throw new Error(
        "Erro ao fazer upload da imagem. Tente novamente mais tarde."
      );
    }

    await sendSuccessReact();

    await sendReply(`Aqui está o link da sua imagem !\n\n- ${link}`);

    fs.unlinkSync(filePath);
  },
};
