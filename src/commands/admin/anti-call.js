import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import {
  isActiveGroupRestriction,
  updateIsActiveGroupRestriction,
} from "../../utils/database.js";
import { isFalse, isTrue } from "../../utils/index.js";

export default {
  name: "anti-call",
  description:
    "Ativa/desativa o recurso de anti-call no grupo, removendo quem iniciar ligação.",
  commands: ["anti-call", "anti-ligacao", "anti-ligação"],
  usage: `${PREFIX}anti-call (1/0)`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ remoteJid, isGroup, args, sendSuccessReply }) => {
    if (!isGroup) {
      throw new WarningError("Este comando só deve ser usado em grupos!");
    }
    if (!args.length) {
      throw new InvalidParameterError(
        "Você precisa digitar 1 ou 0 (ligar ou desligar)!",
      );
    }
    const antiCallOn = isTrue(args[0]);
    const antiCallOff = isFalse(args[0]);
    if (!antiCallOn && !antiCallOff) {
      throw new InvalidParameterError(
        "Você precisa digitar 1 ou 0 (ligar ou desligar)!",
      );
    }
    const hasActive =
      antiCallOn && isActiveGroupRestriction(remoteJid, "anti-call");
    const hasInactive =
      antiCallOff && !isActiveGroupRestriction(remoteJid, "anti-call");
    if (hasActive || hasInactive) {
      throw new WarningError(
        `O recurso de anti-call já está ${
          antiCallOn ? "ativado" : "desativado"
        }!`,
      );
    }
    updateIsActiveGroupRestriction(remoteJid, "anti-call", antiCallOn);
    const status = antiCallOn ? "ativado" : "desativado";
    await sendSuccessReply(`Anti-call ${status} com sucesso!`);
  },
};
