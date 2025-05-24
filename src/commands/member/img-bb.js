const fs = require("fs");

const { PREFIX } = require(`${BASE_DIR}/config`);
const { imgbbUpload } = require(`${BASE_DIR}/services/imgBB`);
const { getRandomNumber } = require(`${BASE_DIR}/utils`);
const { DangerError, InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "img-bb",
  description: "Faço upload de imagens retorno um link de acesso",
  commands: ["img-bb"],
  usage: `${PREFIX}img-bb (marque a imagem) ou 

${PREFIX}img-bb (responda a imagem)`,
  handle: async ({
    isImage,
    downloadImage,
    sendSuccessReact,
    sendWaitReact,
    sendReply,
    webMessage,
  }) => {
    if (!isImage) {
      throw new InvalidParameterError("Você deve marcar ou responder uma imagem!");
    }

    await sendWaitReact();

    const filePath = await downloadImage(
      webMessage,
      `${getRandomNumber(10_000, 99_999)}`
    );

    try {
      const buffer = fs.readFileSync(filePath);
      const result = await imgbbUpload(buffer, {
        name: getRandomNumber(10_00, 99_999)
      });

      if (!result || !result.url) {
        throw new DangerError("Falha ao gerar o link da imagem");
      }

      await sendSuccessReact();
      
      await sendReply(`📁 Upload realizado com sucesso!\n
- Link direto: ${result.url}\n
- Thumbnail: ${result.thumb || result.url}\n
- Expira em: ${result.expiration ? '~' + Math.floor(result.expiration/86400) + ' dias' : 'Nunca'}\n
      `);

    } catch (error) {
      await sendReply("Ocorreu um erro ao processar sua imagem. Por favor, tente novamente.");
    } finally {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  },
};
