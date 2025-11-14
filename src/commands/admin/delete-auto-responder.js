import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { removeAutoResponderItemByKey } from "../../utils/database.js";

export default {
  name: "delete-auto-responder",
  description: "Remove um termo do auto-responder pelo ID",
  commands: [
    "delete-auto-responder",
    "delete-auto",
    "delete-responder",
    "del-auto",
    "del-responder",
    "remove-auto-responder",
    "remove-auto",
    "remove-responder",
  ],
  usage: `${PREFIX}delete-auto-responder 1`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendSuccessReply, args, prefix, sendErrorReply }) => {
    if (args.length !== 1) {
      throw new InvalidParameterError(`Você deve informar o ID do termo a ser removido:

${prefix}remove-auto-responder 1

Use ${prefix}list-auto-responder para ver todos os IDs`);
    }

    const id = parseInt(args[0]);

    if (isNaN(id) || id <= 0) {
      throw new InvalidParameterError(`O ID deve ser um número válido maior que 0.

Use ${prefix}list-auto-responder para ver todos os IDs`);
    }

    const success = removeAutoResponderItemByKey(id);

    if (!success) {
      await sendErrorReply(
        `Não foi possível remover o termo com o ID ${id}. Ele pode não existir ou já ter sido removido!`
      );

      return;
    }

    await sendSuccessReply(
      `O termo com o ID ${id} foi removido do auto-responder com sucesso!`
    );
  },
};
