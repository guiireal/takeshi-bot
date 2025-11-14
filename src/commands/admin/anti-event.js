import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import {
  isActiveGroupRestriction,
  updateIsActiveGroupRestriction,
} from "../../utils/database.js";

export default {
  name: "anti-event",
  description:
    "Ativa/desativa o recurso de anti-event no grupo, apagando a mensagem de evento se estiver ativo.",
  commands: ["anti-event", "anti-evento", "anti-eventos"],
  usage: `${PREFIX}anti-event (1/0)`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ remoteJid, isGroup, args, sendSuccessReply }) => {
    if (!isGroup) {
      throw new WarningError("Este comando só deve ser usado em grupos!");
    }
    if (!args.length) {
      throw new InvalidParameterError(
        "Você precisa digitar 1 ou 0 (ligar ou desligar)!"
      );
    }
    const antiEventOn = args[0] == "1";
    const antiEventOff = args[0] == "0";
    if (!antiEventOn && !antiEventOff) {
      throw new InvalidParameterError(
        "Você precisa digitar 1 ou 0 (ligar ou desligar)!"
      );
    }
    const hasActive =
      antiEventOn && isActiveGroupRestriction(remoteJid, "anti-event");
    const hasInactive =
      antiEventOff && !isActiveGroupRestriction(remoteJid, "anti-event");
    if (hasActive || hasInactive) {
      throw new WarningError(
        `O recurso de anti-event já está ${
          antiEventOn ? "ativado" : "desativado"
        }!`
      );
    }
    updateIsActiveGroupRestriction(remoteJid, "anti-event", antiEventOn);
    const status = antiEventOn ? "ativado" : "desativado";
    await sendSuccessReply(`Anti-event ${status} com sucesso!`);
  },
};
