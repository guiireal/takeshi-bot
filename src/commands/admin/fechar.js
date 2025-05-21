const { PREFIX } = require(`${BASE_DIR}/config`);
const { errorLog } = require(`${BASE_DIR}/utils/logger`);

module.exports = {
  name: "fechar",
  description: "Fecha o grupo.",
  commands: [
    "fechar",
    "fecha",
    "fechar-grupo",
    "fecha-grupo",
    "close",
    "close-group",
  ],
  usage: `${PREFIX}fechar`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ socket, remoteJid, sendSuccessReply, sendErrorReply }) => {
    try {
      await socket.groupSettingUpdate(remoteJid, "announcement");
      await sendSuccessReply("Grupo fechado com sucesso!");
    } catch (error) {
      await sendErrorReply(
        "Para fechar o grupo, eu preciso ser administrador dele!"
      );
      errorLog(
        `Ocorreu um erro ao fechar o grupo! Causa: ${JSON.stringify(
          error,
          null,
          2
        )}`
      );
    }
  },
};
