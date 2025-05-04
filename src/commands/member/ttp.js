const { PREFIX } = require(`${BASE_DIR}/config`);
const { ttp } = require(`${BASE_DIR}/services/spider-x-api`);
const {
  InvalidParameterError,
} = require(`${BASE_DIR}/errors/InvalidParameterError`);

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

    await sendSuccessReact();

    await sendStickerFromURL(url);
  },
};
