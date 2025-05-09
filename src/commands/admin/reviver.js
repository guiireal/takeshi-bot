const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "Reviver membro",
  description: "Adiciona de volta ao grupo um membro que saiu (respondendo a mensagem dele)",
  commands: ["reviver"],
  usage: `${PREFIX}reviver (responda a mensagem da pessoa que saiu)`,
  handle: async ({ isReply, webMessage, sendErrorReply, sendReply, remoteJid, socket }) => {
    if (!isReply) {
      return sendErrorReply("Responda à mensagem da pessoa que saiu para adicioná-la novamente.");
    }

    const participantJid = webMessage.message?.extendedTextMessage?.contextInfo?.participant;

    if (!participantJid) {
      return sendErrorReply("Não consegui identificar quem você respondeu.");
    }

    try {
      await socket.groupParticipantsUpdate(remoteJid, [participantJid], "add");
      await sendReply("Membro adicionado de volta ao grupo com sucesso!");
    } catch (error) {
      console.error("Erro ao tentar reviver:", error);
      sendErrorReply("Não consegui adicionar essa pessoa. Ela pode ter saído recentemente, estar bloqueada ou ter restrição de privacidade.");
    }
  },
};