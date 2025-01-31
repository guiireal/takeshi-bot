const { PREFIX, SPIDER_API_TOKEN } = require(`${BASE_DIR}/config`);
const fetch = require('node-fetch');

module.exports = {
  name: "ia-sticker",
  description: "cria uma figurinha com base em uma descrição",
  commands: ["ia-sticker", "ia-fig"],
  usage: `${PREFIX}ia-sticker <descrição>`,
  handle: async ({
    args,
    sendWaitReply,
    sendWarningReply,
    sendStickerFromURL,
    sendSuccessReact,
    sendErrorReply
  }) => {
    if (!args[0]) {
      return sendWarningReply("Você precisa fornecer uma descrição para a imagem.");
    }

    const descricao = args[0];

    const apiUrl = `https://api.spiderx.com.br/api/ai/stable-diffusion-turbo?search=${encodeURIComponent(descricao)}&api_key=${SPIDER_API_TOKEN}`;

        sendWaitReply("Gerando figurinha...");

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.image) {
        sendStickerFromURL(data.image);
        sendSuccessReact();
      } else {
        sendWarningReply("Não foi possível gerar a figurinha. Tente novamente mais tarde.");
      }
    } catch (error) {
      console.log(error);
      sendErrorReply("Houve um erro ao tentar gerar a imagem. Verifique sua conexão ou tente mais tarde.");
    }
  },
};
