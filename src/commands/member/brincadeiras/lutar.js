const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "Lutar",
  description: "Lute um mano a mano ou bata no seu inimigo...",
  commands: ["lutar"],
  usage: `${PREFIX}lutar @usuario`,
  handle: async ({ socket, webMessage, sendErrorReply, userJid, remoteJid }) => {
    const mentionedJid = webMessage?.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    if (!mentionedJid.length) {
      return sendErrorReply('Você precisa mencionar um usuário para Tretar.');
    }

    const target = mentionedJid[0];
    const user = userJid.split("@")[0];
    const targetUser = target.split("@")[0];

    await socket.sendMessage(remoteJid, {
      video: { url: 'https://media.tenor.com/77ly7fn1RagAAAPo/sung-jin-woo-jinwoo.mp4' },
      caption: `@${user} Teve uma treta imensa com @${targetUser}!`,
      gifPlayback: true,
      mentions: [userJid, target]
    });
  },
};