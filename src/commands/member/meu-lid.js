import { PREFIX } from "../../config.js";
import InvalidParameterError from "../../errors/InvalidParameterError.js";

export default {
  name: "meu-lid",
  description: "Retorna o LID da pessoa",
  commands: ["meu-lid", "my-lid", "lid"],
  usage: `${PREFIX}meu-lid`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendSuccessReply, replyLid, userLid, args }) => {
    if (args.length) {
      throw new InvalidParameterError(`Não tem mais como por o número na frente.

Para pegar seu LID:

${PREFIX}meu-lid

Para ver o lid de outra pessoa ela tem que estar no grupo e
você responde com o comando:

${PREFIX}lid (em cima de qualquer mensagem dela)`);
    }

    if (replyLid) {
      await sendSuccessReply(`LID do contato mencionado: ${replyLid}`);
    } else {
      await sendSuccessReply(`Seu LID: ${userLid}`);
    }
  },
};
