import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import {
  isActiveGroupRestriction,
  updateIsActiveGroupRestriction,
} from "../../utils/database.js";
import { isFalse, isTrue } from "../../utils/index.js";

export default {
  name: "anti-sticker-audio",
  description:
    "Ativa/desativa o anti-sticker-audio no grupo, apagando só as figurinhas com áudio.",
  commands: [
    "anti-sticker-audio",
    "anti-stickeraudio",
    "anti-figu-audio",
    "anti-figurinha-audio",
  ],
  usage: `${PREFIX}anti-sticker-audio (1/0)`,
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
    const on = isTrue(args[0]);
    const off = isFalse(args[0]);
    if (!on && !off) {
      throw new InvalidParameterError(
        "Você precisa digitar 1 ou 0 (ligar ou desligar)!",
      );
    }
    const active = isActiveGroupRestriction(remoteJid, "anti-sticker-audio");
    if ((on && active) || (off && !active)) {
      throw new WarningError(
        `O recurso de anti-sticker-audio já está ${
          on ? "ativado" : "desativado"
        }!`,
      );
    }
    updateIsActiveGroupRestriction(remoteJid, "anti-sticker-audio", on);
    await sendSuccessReply(
      `Anti-sticker-audio ${on ? "ativado" : "desativado"} com sucesso!`,
    );
  },
};
