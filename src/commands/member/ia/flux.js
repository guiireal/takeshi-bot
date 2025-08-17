const { imageAI } = require(`${BASE_DIR}/services/spider-x-api`);

const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "flux",
  description: "Cria uma imagem usando a IA Flux",
  commands: ["flux"],
  usage: `${PREFIX}flux descrição`,
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

    const data = await imageAI(fullArgs);

    if (!data?.image) {
      return sendWarningReply(
        "Não foi possível gerar a imagem! Tente novamente mais tarde."
      );
    }

    await sendSuccessReact();
    await sendImageFromURL(data.image);
  },
};
