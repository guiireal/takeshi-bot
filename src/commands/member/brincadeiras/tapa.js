const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "Tapa",
  description: "Dá. um tapa em alguém",
  commands: ["Tapa"],
  usage: `${PREFIX}tapa @usuario`,
  handle: async ({ socket, webMessage, sendErrorReply, userJid, remoteJid }) => {
    const mentionedJid = webMessage?.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    if (!mentionedJid.length) {
      return sendErrorReply('Você precisa mencionar um usuário para dar um Tapa.');
    }

    const target = mentionedJid[0];
    const user = userJid.split("@")[0];
    const targetUser = target.split("@")[0];

    await socket.sendMessage(remoteJid, {
      video: { url: 'https://media.tenor.com/eU5H6GbVjrcAAAPo/slap-jjk.mp4' },
      caption: `@${user} Deu um tapa na cara de @${targetUser}!`,
      gifPlayback: true,
      mentions: [userJid, target]
    });
  },
};