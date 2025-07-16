const { PREFIX } = require(`${BASE_DIR}/config`);
const { ttp } = require(`${BASE_DIR}/services/spider-x-api`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "ttp",
  description: "Faz figurinhas de texto.",
  commands: ["ttp"],
  usage: `${PREFIX}ttp teste`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    sendWaitReact,
    args,
    sendStickerFromURL,
    sendSuccessReact,
  }) => {
    if (!args.length) {
      throw new InvalidParameterError(
        "Você precisa informar o texto que deseja transformar em figurinha."
      );
    }

    await sendWaitReact();

    const url = await ttp(args[0].trim());

    const response = await fetch(url);

    if (!response.ok) {
      const data = await response.json();

      await sendErrorReply(
        `Ocorreu um erro ao executar uma chamada remota para a Spider X API no comando ttp!
      
📄 *Detalhes*: ${data.message}`
      );
      return;
    }

    await sendSuccessReact();

    await sendStickerFromURL(url);
  },
};
