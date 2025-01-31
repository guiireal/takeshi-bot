const { stableDiffusion } = require("../../services/spider-x-api");

const { PREFIX, SPIDER_API_TOKEN } = require(`${BASE_DIR}/config`);

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
    fullArgs,
  }) => {
    if (!args[0]) {
      return sendWarningReply(
        "Você precisa fornecer uma descrição para a imagem."
      );
    }

    await sendWaitReply("Gerando figurinha...");

    const data = await stableDiffusion(fullArgs);

    if (data.image) {
      await sendStickerFromURL(data.image);
      await sendSuccessReact();
    } else {
      await sendWarningReply(
        "Não foi possível gerar a figurinha. Tente novamente mais tarde."
      );
    }
  },
};
