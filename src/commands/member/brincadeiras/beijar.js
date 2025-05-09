const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "beijo",
  description: "Beija um usuário que vc ama",
  commands: ["beijar"],
  usage: `${PREFIX}beijar @usuario`,
  handle: async ({ socket, webMessage, sendErrorReply, userJid, remoteJid }) => {
    const mentionedJid = webMessage?.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    if (!mentionedJid.length) {
      return sendErrorReply('Você precisa mencionar um usuário para Beijar.');
    }

    const target = mentionedJid[0];
    const user = userJid.split("@")[0];
    const targetUser = target.split("@")[0];

    await socket.sendMessage(remoteJid, {
      video: { url: 'https://media.tenor.com/_8oadF3hZwIAAAPo/kiss.mp4' },
      caption: `@${user} Beijou @${targetUser}!`,
      gifPlayback: true,
      mentions: [userJid, target]
    });
  },
};