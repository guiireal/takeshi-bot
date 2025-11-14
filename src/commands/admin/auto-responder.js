import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import {
  activateAutoResponderGroup,
  deactivateAutoResponderGroup,
} from "../../utils/database.js";

export default {
  name: "auto-responder",
  description: "Ativo/desativo o recurso de auto-responder no grupo.",
  commands: ["auto-responder"],
  usage: `${PREFIX}auto-responder (1/0)`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, sendReply, sendSuccessReact, remoteJid }) => {
    if (!args.length) {
      throw new InvalidParameterError(
        "Você precisa digitar 1 ou 0 (ligar ou desligar)!"
      );
    }
    const autoResponder = args[0] == "1";
    const notAutoResponder = args[0] == "0";
    if (!autoResponder && !notAutoResponder) {
      throw new InvalidParameterError(
        "Você precisa digitar 1 ou 0 (ligar ou desligar)!"
      );
    }
    if (autoResponder) {
      activateAutoResponderGroup(remoteJid);
    } else {
      deactivateAutoResponderGroup(remoteJid);
    }
    await sendSuccessReact();
    const context = autoResponder ? "ativado" : "desativado";
    await sendReply(`Recurso de auto-responder ${context} com sucesso!`);
  },
};
