const { setBotNumber } = require(`${BASE_DIR}/utils/database`);

const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { onlyNumbers } = require(`${BASE_DIR}/utils`);

module.exports = {
  name: "set-bot-number",
  description: "Mudo o número do bot",
  commands: [
    "set-bot-number",
    "altera-bot-number",
    "altera-numero-bot",
    "alterar-bot-number",
    "alterar-numero-bot",
    "bot-number",
    "muda-bot-number",
    "muda-numero-bot",
    "mudar-bot-number",
    "mudar-numero-bot",
    "numero-bot",
    "set-numero-bot",
  ],
  usage: `${PREFIX}set-bot-number +55 9999999999`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ args, sendSuccessReply }) => {
    if (!args.length) {
      throw new InvalidParameterError("Você deve fornecer um número!");
    }

    if (args[0].length < 9 || args[0].length > 18) {
      throw new InvalidParameterError(
        "O número deve ter entre 9 e 18 caracteres!"
      );
    }

    const newNumber = onlyNumbers(args[0]);

    setBotNumber(newNumber);

    await sendSuccessReply(`Número do bot alterado com sucesso!`);
  },
};
