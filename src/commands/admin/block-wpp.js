import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { toUserJid } from "../../utils/index.js";
import { errorLog } from "../../utils/logger.js";

export default {
  name: "block-wpp",
  description: "Bloqueia um número no WhatsApp do bot",
  commands: ["block-wpp", "blok-wpp", "bloquear-wpp"],
  usage: `${PREFIX}block-wpp <telefone>`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, socket, sendSuccessReply, sendErrorReply }) => {
    if (args.length !== 1) {
      throw new InvalidParameterError(
        `Informe um telefone válido.
        
Exemplo: ${PREFIX}block-wpp +5541123456789`,
      );
    }

    const memberToBlockJid = toUserJid(args[0]);

    try {
      await socket.updateBlockStatus(memberToBlockJid, "block");
      await sendSuccessReply("Número bloqueado com sucesso!");
    } catch (error) {
      errorLog(`Erro ao bloquear número: ${error.message}`);
      await sendErrorReply(
        `Não foi possível bloquear o número!
        
Erro: ${error.message}`,
      );
    }
  },
};
