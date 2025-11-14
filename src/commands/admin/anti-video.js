import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import {
  isActiveGroupRestriction,
  updateIsActiveGroupRestriction,
} from "../../utils/database.js";

export default {
  name: "anti-video",
  description:
    "Ativa/desativa o recurso de anti-video no grupo, apagando a mensagem de vídeo se estiver ativo.",
  commands: ["anti-video", "anti-videos"],
  usage: `${PREFIX}anti-video (1/0)`,
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
    const antiVideoOn = args[0] == "1";
    const antiVideoOff = args[0] == "0";
    if (!antiVideoOn && !antiVideoOff) {
      throw new InvalidParameterError(
        "Você precisa digitar 1 ou 0 (ligar ou desligar)!"
      );
    }
    const hasActive =
      antiVideoOn && isActiveGroupRestriction(remoteJid, "anti-video");
    const hasInactive =
      antiVideoOff && !isActiveGroupRestriction(remoteJid, "anti-video");
    if (hasActive || hasInactive) {
      throw new WarningError(
        `O recurso de anti-video já está ${
          antiVideoOn ? "ativado" : "desativado"
        }!`
      );
    }
    updateIsActiveGroupRestriction(remoteJid, "anti-video", antiVideoOn);
    const status = antiVideoOn ? "ativado" : "desativado";
    await sendSuccessReply(`Anti-video ${status} com sucesso!`);
  },
};
