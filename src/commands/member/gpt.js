const { PREFIX } = require("../../config");
const { gpt } = require("../../services/spider-x-api");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");

module.exports = {
  name: "gpt",
  description: "Comandos de inteligência artificial!",
  commands: ["gpt", "takeshi"],
  usage: `${PREFIX}gpt com quantos paus se faz uma canoa?`,
  handle: async ({ sendSuccessReply, sendWaitReply, args }) => {
    const text = args[0];

    if (!text) {
      throw new InvalidParameterError(
        "Você precisa me dizer o que eu devo responder!"
      );
    }

    await sendWaitReply();

    const responseText = await gpt(text);

    await sendSuccessReply(responseText);
  },
};
