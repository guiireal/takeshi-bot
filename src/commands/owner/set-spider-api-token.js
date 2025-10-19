const { setSpiderApiToken } = require(`${BASE_DIR}/utils/database`);

const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "set-spider-api-token",
  description: "Mudo o token da API do Spider",
  commands: [
    "set-spider-api-token",
    "altera-spider-api-token",
    "alterar-spider-api-token",
    "muda-spider-api-token",
    "mudar-spider-api-token",
    "spider-api-token",
  ],
  usage: `${PREFIX}set-spider-api-token token aqui`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ args, sendSuccessReply }) => {
    if (!args.length) {
      throw new InvalidParameterError("Você deve fornecer um token!");
    }

    if (args[0].length < 8 || args[0].length > 25) {
      throw new InvalidParameterError(
        "O token deve ter entre 8 e 25 caracteres!"
      );
    }

    const newToken = args[0];

    setSpiderApiToken(newToken);

    await sendSuccessReply(`Token da Spider API alterado com sucesso!`);
  },
};
