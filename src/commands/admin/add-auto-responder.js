const { addAutoResponderItem } = require(`${BASE_DIR}/utils/database`);

const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "add-auto-responder",
  description: "Adiciona um termo no auto-responder",
  commands: ["add-auto-responder", "add-auto", "add-responder"],
  usage: `${PREFIX}add-auto-responder Boa tarde! / Boa tarde pra você também!`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendSuccessReply, args, prefix, sendErrorReply }) => {
    if (args.length !== 2) {
      throw new InvalidParameterError(`Você deve informar o termo e a resposta do auto-responder da seguinte forma:

${prefix}add-auto-responder termo / o que eu devo responder`);
    }

    const success = await addAutoResponderItem(args[0], args[1]);

    if (!success) {
      await sendErrorReply(`O termo "${args[0]}" já existe no auto-responder!`);

      return;
    }

    await sendSuccessReply(
      `O termo "${args[0]}" foi adicionado ao auto-responder com a resposta "${args[1]}".`
    );
  },
};
