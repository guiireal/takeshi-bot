const { imageAI } = require(`${BASE_DIR}/services/spider-x-api`);

const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "stable-diffusion-turbo",
  description: "Cria uma imagem usando a IA Stable Diffusion Turbo",
  commands: [
    "stable-diffusion-turbo",
    "stable-dif-turbo",
    "stable-dif",
    "stable-diff-turbo",
    "stable-diff",
    "stable-diffusion",
    "stable-difusion-turbo",
    "stable-difusion",
  ],
  usage: `${PREFIX}stable-diffusion-turbo descrição`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    args,
    sendWaitReply,
    sendWarningReply,
    sendImageFromURL,
    sendSuccessReact,
    fullArgs,
  }) => {
    if (!args[0]) {
      return sendWarningReply(
        "Você precisa fornecer uma descrição para a imagem."
      );
    }

    await sendWaitReply("gerando imagem...");

    const data = await imageAI("stable-diffusion-turbo", fullArgs);

    if (!data?.image) {
      return sendWarningReply(
        "Não foi possível gerar a imagem! Tente novamente mais tarde."
      );
    }

    await sendSuccessReact();
    await sendImageFromURL(data.image);
  },
};
