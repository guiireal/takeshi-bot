const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "delete",
  description: "Excluo mensagens",
  commands: ["delete", "d"],
  usage: `${PREFIX}delete (mencione uma mensagem)`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ deleteMessage, webMessage, remoteJid }) => {
    const { stanzaId, participant } =
      webMessage?.message?.extendedTextMessage?.contextInfo;

    if (!stanzaId || !participant) {
      throw new InvalidParameterError(
        "Você deve mencionar uma mensagem para excluir!"
      );
    }

    await deleteMessage({
      remoteJid,
      fromMe: false,
      id: stanzaId,
      participant,
    });
  },
};
