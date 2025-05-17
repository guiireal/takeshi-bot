const { PREFIX } = require(`${BASE_DIR}/config`);
const { gpt4 } = require(`${BASE_DIR}/services/spider-x-api`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "gpt-4",
  description: "Comandos de inteligência artificial!",
  commands: ["gpt-4", "gpt", "takeshi"],
  usage: `${PREFIX}gpt com quantos paus se faz uma canoa?`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendSuccessReply, sendWaitReply, args }) => {
    const text = args[0];

    if (!text) {
      throw new InvalidParameterError(
        "Você precisa me dizer o que eu devo responder!"
      );
    }

    await sendWaitReply();

    const responseText = await gpt4(text);

    await sendSuccessReply(responseText);
  },
};
