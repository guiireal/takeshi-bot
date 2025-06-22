const { PREFIX } = require(`${BASE_DIR}/config`);
const { activateGroup } = require(`${BASE_DIR}/utils/database`);

module.exports = {
  name: "on",
  description: "Ativa o bot no grupo",
  commands: ["on"],
  usage: `${PREFIX}on`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendSuccessReply, remoteJid, isGroup }) => {
    if (!isGroup) {
      throw new WarningError("Este comando deve ser usado dentro de um grupo.");
    }

    activateGroup(remoteJid);

    await sendSuccessReply("Bot ativado no grupo!");
  },
};
