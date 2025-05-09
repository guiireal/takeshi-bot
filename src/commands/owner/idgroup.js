const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "getgroupid",
  description: "Retorna o ID completo de um grupo no formato JID.",
  commands: ["getgroupid", "idget"],
  usage: `${PREFIX}getgroupid`,
  handle: async ({ remoteJid, sendReply }) => {
    if (!remoteJid.endsWith('@g.us')) {
      return sendReply('Este comando deve ser usado dentro de um grupo.');
    }

    sendReply(`ID do grupo: *${remoteJid}*`);
  },
};