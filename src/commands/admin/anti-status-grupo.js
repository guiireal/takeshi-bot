import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import {
  isActiveGroupRestriction,
  updateIsActiveGroupRestriction,
} from "../../utils/database.js";

export default {
  name: "anti-status-grupo",
  description:
    "Ativa/desativa o recurso de anti-status-grupo no grupo, removendo quem marcar status no grupo.",
  commands: [
    "anti-status-grupo",
    "anti-marcacao-status-grupo",
    "anti-marcação-status-grupo",
  ],
  usage: `${PREFIX}anti-status-grupo (1/0)`,
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
    const antiStatusGrupoOn = args[0] == "1";
    const antiStatusGrupoOff = args[0] == "0";
    if (!antiStatusGrupoOn && !antiStatusGrupoOff) {
      throw new InvalidParameterError(
        "Você precisa digitar 1 ou 0 (ligar ou desligar)!",
      );
    }
    const hasActive =
      antiStatusGrupoOn &&
      isActiveGroupRestriction(remoteJid, "anti-status-grupo");
    const hasInactive =
      antiStatusGrupoOff &&
      !isActiveGroupRestriction(remoteJid, "anti-status-grupo");
    if (hasActive || hasInactive) {
      throw new WarningError(
        `O recurso de anti-status-grupo já está ${
          antiStatusGrupoOn ? "ativado" : "desativado"
        }!`,
      );
    }
    updateIsActiveGroupRestriction(
      remoteJid,
      "anti-status-grupo",
      antiStatusGrupoOn,
    );
    const status = antiStatusGrupoOn ? "ativado" : "desativado";
    await sendSuccessReply(`Anti-status-grupo ${status} com sucesso!`);
  },
};
