const { imageAI } = require(`${BASE_DIR}/services/spider-x-api`);

const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "ia-sticker",
  description: "Cria uma figurinha com base em uma descrição",
  commands: ["ia-sticker", "ia-fig"],
  usage: `${PREFIX}ia-sticker descrição`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
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

    await sendWaitReply("gerando figurinha...");

    const data = await imageAI(fullArgs);

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
