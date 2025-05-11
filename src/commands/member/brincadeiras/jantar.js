const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "jantar",
  description: "vá a um jantar com um usuário desejado.",
  commands: ["jantar"],
  usage: `${PREFIX}jantar @usuario`,
  handle: async ({ socket, webMessage, sendErrorReply, userJid, remoteJid, replyJid }) => {
    const mentionedJid = webMessage?.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const target = replyJid || (mentionedJid.length ? mentionedJid[0] : null);

    if (!target) {
      return sendErrorReply('Você precisa mencionar um usuário ou responder uma mensagem para ir a um jantar.');
    }

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