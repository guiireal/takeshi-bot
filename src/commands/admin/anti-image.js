import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import {
  isActiveGroupRestriction,
  updateIsActiveGroupRestriction,
} from "../../utils/database.js";
import { isFalse, isTrue } from "../../utils/index.js";

export default {
  name: "anti-image",
  description:
    "Ativa/desativa o recurso de anti-image no grupo, apagando a mensagem de imagem se estiver ativo.",
  commands: ["anti-image", "anti-img", "anti-imagem", "anti-imagens"],
  usage: `${PREFIX}anti-image (1/0)`,
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
    const antiImageOn = isTrue(args[0]);
    const antiImageOff = isFalse(args[0]);
    if (!antiImageOn && !antiImageOff) {
      throw new InvalidParameterError(
        "Você precisa digitar 1 ou 0 (ligar ou desligar)!",
      );
    }
    const hasActive =
      antiImageOn && isActiveGroupRestriction(remoteJid, "anti-image");
    const hasInactive =
      antiImageOff && !isActiveGroupRestriction(remoteJid, "anti-image");
    if (hasActive || hasInactive) {
      throw new WarningError(
        `O recurso de anti-image já está ${
          antiImageOn ? "ativado" : "desativado"
        }!`,
      );
    }
    updateIsActiveGroupRestriction(remoteJid, "anti-image", antiImageOn);
    const status = antiImageOn ? "ativado" : "desativado";
    await sendSuccessReply(`Anti-image ${status} com sucesso!`);
  },
};
