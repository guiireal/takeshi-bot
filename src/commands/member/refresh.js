import { PREFIX } from "../../config.js";
import { updateGroupMetadataCache } from "../../connection.js";
import { errorLog } from "../../utils/logger.js";

export default {
  name: "refresh",
  description: "Atualiza os dados do participante",
  commands: ["refresh", "fresh"],
  usage: `${PREFIX}refresh`,
  /**
   * @param {CommandHandleProps} props
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

Caso você seja o dono do grupo, não esqueça de configurar o LID do dono em:

\`src/config.js\`

\`\`\`
export const OWNER_LID = "1234567890@lid";
\`\`\`

Para configurar o LID, 
utilize o comando 

${prefix}meu-lid

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
