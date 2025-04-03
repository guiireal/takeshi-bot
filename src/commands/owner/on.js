const { PREFIX } = require(`${BASE_DIR}/config`);
const { activateGroup } = require(`${BASE_DIR}/utils/database`);

module.exports = {
  name: "on",
  description: "Ativa o bot no grupo",
  commands: ["on"],
  usage: `${PREFIX}on`,
  handle: async ({ sendSuccessReply, remoteJid }) => {
    activateGroup(remoteJid);

    await sendSuccessReply("Bot ativado no grupo!");
  },
};
