const { PREFIX } = require(`${BASE_DIR}/config`);
const { WarningError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "get-id",
  description: "Retorna o ID completo de um grupo no formato JID.",
  commands: ["get-id", "get-group-id", "id-get", "id-group"],
  usage: `${PREFIX}get-id`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ remoteJid, sendSuccessReply, isGroup }) => {
    if (!isGroup) {
      throw new WarningError("Este comando deve ser usado dentro de um grupo.");
    }

    await sendSuccessReply(`*ID do grupo*: ${remoteJid}`);
  },
};
