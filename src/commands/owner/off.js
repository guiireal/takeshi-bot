const { PREFIX } = require(`${BASE_DIR}/config`);
const { deactivateGroup } = require(`${BASE_DIR}/utils/database`);

module.exports = {
  name: "off",
  description: "Desativa o bot no grupo",
  commands: ["off"],
  usage: `${PREFIX}off`,
  handle: async ({ sendSuccessReply, remoteJid }) => {
    deactivateGroup(remoteJid);

    await sendSuccessReply("Bot desativado no grupo!");
  },
};
