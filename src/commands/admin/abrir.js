const { PREFIX } = require(`${BASE_DIR}/config`);
const { errorLog } = require(`${BASE_DIR}/utils/logger`);

module.exports = {
  name: "abrir",
  description: "Abre o grupo.",
  commands: [
    "abrir",
    "abri",
    "abre",
    "abrir-grupo",
    "abri-grupo",
    "abre-grupo",
    "open",
    "open-group",
  ],
  usage: `${PREFIX}abrir`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ socket, remoteJid, sendSuccessReply, sendErrorReply }) => {
    try {
      await socket.groupSettingUpdate(remoteJid, "not_announcement");
      await sendSuccessReply("Grupo aberto com sucesso!");
    } catch (error) {
      await sendErrorReply(
        "Para abrir o grupo, eu preciso ser administrador dele!"
      );
      errorLog(
        `Ocorreu um erro ao abrir o grupo! Causa: ${JSON.stringify(
          error,
          null,
          2
        )}`
      );
    }
  },
};
