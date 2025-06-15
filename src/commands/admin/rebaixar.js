const { PREFIX } = require(`${BASE_DIR}/config`);
const { isGroup } = require(`${BASE_DIR}/utils`);
const { errorLog } = require(`${BASE_DIR}/utils/logger`);

module.exports = {
  name: "rebaixar",
  description: "Rebaixa um administrador para membro comum",
  commands: ["rebaixar", "rebaixa", "demote"],
  usage: `${PREFIX}rebaixar @usuario`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    args,
    remoteJid,
    socket,
    sendWarningReply,
    sendSuccessReply,
    sendErrorReply,
  }) => {
    if (!isGroup(remoteJid)) {
      return sendWarningReply("Este comando só pode ser usado em grupo !");
    }

    if (!args.length || !args[0]) {
      return sendWarningReply(
        "Por favor, marque um administrador para rebaixar."
      );
    }

    const userId = args[0].replace("@", "") + "@s.whatsapp.net";

    try {
      await socket.groupParticipantsUpdate(remoteJid, [userId], "demote");
      await sendSuccessReply("Usuário rebaixado com sucesso!");
    } catch (error) {
      errorLog(`Erro ao rebaixar administrador: ${error.message}`);
      await sendErrorReply(
        "Ocorreu um erro ao tentar rebaixar o usuário. Eu preciso ser administrador do grupo para rebaixar outros administradores!"
      );
    }
  },
};
