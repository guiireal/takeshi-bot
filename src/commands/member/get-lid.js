const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError, WarningError } = require(`${BASE_DIR}/errors`);
const { onlyNumbers } = require(`${BASE_DIR}/utils`);

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

    const [result] = await socket.onWhatsApp(onlyNumbers(args[0]));

    if (!result) {
      throw new WarningError(
        "O número informado não está registrado no WhatsApp!"
      );
    }

    const jid = result?.jid;
    const lid = result?.lid;

    await sendSuccessReply(`JID: ${jid}${lid ? `\nLID: ${lid}` : ""}`);
  },
};
