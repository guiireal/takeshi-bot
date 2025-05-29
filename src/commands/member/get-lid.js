const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "get-lid",
  description: "Retorna o LID do contato mencionado.",
  commands: ["get-lid"],
  usage: `${PREFIX}get-lid @marca ou +telefone`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ args, sendSuccessReply, socket }) => {
    if (!args.length) {
      throw new InvalidParameterError(
        "Você deve mencionar alguém ou informar um contato!"
      );
    }

    const [result] = await socket.onWhatsApp(args[0].trim());

    const onWhatsApp = result.exists;
    const jid = result.jid;
    const lid = result?.lid;

    await sendSuccessReply(
      `O número ${args[0]} ${onWhatsApp ? "possui" : "não possui"} WhatsApp.

JID: ${jid}${lid ? `\nLID: ${lid}` : ""}`
    );
  },
};
