const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "jantar",
  description: "vá a um jantar com um usuário desejado.",
  commands: ["jantar"],
  usage: `${PREFIX}jantar @usuario`,
  handle: async ({ socket, webMessage, sendErrorReply, userJid, remoteJid }) => {
    const mentionedJid = webMessage?.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    if (!mentionedJid.length) {
      return sendErrorReply('Você precisa mencionar um usuário para ir a um jantar.');
    }

    const target = mentionedJid[0];
    const user = userJid.split("@")[0];
    const targetUser = target.split("@")[0];

    await socket.sendMessage(remoteJid, {
      video: { url: 'https://media.tenor.com/maOjuHhoDFYAAAPo/gintama-gintoki.mp4' },
      caption: `@${user} Foi a um jantar com @${targetUser}!`,
      gifPlayback: true,
      mentions: [userJid, target]
    });
  },
};