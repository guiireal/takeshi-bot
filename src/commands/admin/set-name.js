import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import { errorLog } from "../../utils/logger.js";

export default {
  name: "set-name",
  description: "Altera o nome do grupo e salva o nome antigo",
  commands: ["set-name", "set-group-name", "mudar-nome-grupo", "nome-grupo"],
  usage: `${PREFIX}set-name novo nome do grupo`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    fullArgs,
    remoteJid,
    socket,
    sendErrorReply,
    sendSuccessReply,
    sendWaitReply,
    isGroup,
  }) => {
    if (!isGroup) {
      throw new WarningError("Esse comando só pode ser usado em grupos.");
    }
    if (!fullArgs) {
      throw new InvalidParameterError(
        "Você precisa fornecer um novo nome para o grupo!"
      );
    }
    const minLength = 3;
    const maxLength = 40;
    if (fullArgs.length < minLength || fullArgs.length > maxLength) {
      throw new InvalidParameterError(
        `O nome do grupo deve ter entre ${minLength} e ${maxLength} caracteres!`
      );
    }
    try {
      await sendWaitReply("Alterando o nome do grupo...");
      const groupMetadata = await socket.groupMetadata(remoteJid);
      const oldName = groupMetadata.subject;
      await socket.groupUpdateSubject(remoteJid, fullArgs);
      await sendSuccessReply(
        `Nome do grupo alterado com sucesso!\n\n*Antigo*: ${oldName}\n\n*Novo*: ${fullArgs}`
      );
    } catch (error) {
      errorLog("Error ao alterar o nome do grupo:", error);
      await sendErrorReply(
        "Falha ao alterar o nome do grupo. Verifique se tenho permissão de administrador."
      );
    }
  },
};
