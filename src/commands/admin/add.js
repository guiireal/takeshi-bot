const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "Adicionar membro",
  description: "Adiciona um número ao grupo",
  commands: ["add"],
  usage: `${PREFIX}add 559999999999`,
  handle: async ({ args, sendReply, sendErrorReply, remoteJid, socket }) => {
    if (!args[0]) return sendErrorReply("Você precisa fornecer o número com DDD. Ex: ~add 559999999999");

    let number = args[0].replace(/[^0-9]/g, "");
    if (number.length < 11) return sendErrorReply("Número inválido. Use o formato completo com DDD.");

    const jid = `${number}@s.whatsapp.net`;

    try {
      await socket.groupParticipantsUpdate(remoteJid, [jid], "add");
      await sendReply(`O número ${number} foi adicionado no grupo!`);
    } catch (err) {
      console.error("Erro ao adicionar:", err);
      sendErrorReply("Não foi possível adicionar. O número pode ter saído recentemente ou bloqueou o grupo.");
    }
  },
};