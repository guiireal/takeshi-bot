const { PREFIX } = require(`${BASE_DIR}/config`);
const { updateGroupMetadataCache } = require(`${BASE_DIR}/connection`);
const { errorLog } = require(`${BASE_DIR}/utils/logger`);

module.exports = {
  name: "refresh",
  description: "Atualiza os dados do participante",
  commands: ["refresh", "fresh"],
  usage: `${PREFIX}refresh`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    prefix,
    socket,
    remoteJid,
    sendSuccessReply,
    sendErrorReply,
  }) => {
    try {
      const data = await socket.groupMetadata(remoteJid);
      updateGroupMetadataCache(remoteJid, data);
      await sendSuccessReply(
        `Dados atualizados com sucesso! Tente novamente fazer o que você estava tentando!

Caso você seja o dono do grupo, não esqueça de configurar o número do dono e o LID do dono em:

\`src/config.js\`

\`\`\`
exports.OWNER_NUMBER = "5511999999999";

exports.OWNER_LID = "1234567890@lid";
\`\`\`

Para configurar o LID, 
utilize o comando 

${prefix}get-lid seu_número_aqui

Depois pegue o número do LID que foi respondido e coloque na configuração acima.

Caso já tenha feito tudo isso, ignore.`
      );
    } catch (error) {
      errorLog(
        `Erro ao atualizar dados do participante: ${error.message || error}`
      );
      await sendErrorReply(
        "Ocorreu um erro ao atualizar os dados do participante."
      );
    }
  },
};
