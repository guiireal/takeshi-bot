import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import {
  isActiveGroupRestriction,
  updateIsActiveGroupRestriction,
} from "../../utils/database.js";

export default {
  name: "anti-lottie-sticker",
  description:
    "Ativa/desativa o recurso de anti-lottie-sticker no grupo, apagando a figurinha lottie se estiver ativo.",
  commands: [
    "anti-lottie-sticker",
    "anti-lottie-figu",
    "anti-lottie-figurinha",
    "anti-lottie-figurinhas",
  ],
  usage: `${PREFIX}anti-lottie-sticker (1/0)`,
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
    const antiLottieStickerOn = args[0] == "1";
    const antiLottieStickerOff = args[0] == "0";
    if (!antiLottieStickerOn && !antiLottieStickerOff) {
      throw new InvalidParameterError(
        "Você precisa digitar 1 ou 0 (ligar ou desligar)!",
      );
    }
    const hasActive =
      antiLottieStickerOn &&
      isActiveGroupRestriction(remoteJid, "anti-lottieSticker");
    const hasInactive =
      antiLottieStickerOff &&
      !isActiveGroupRestriction(remoteJid, "anti-lottieSticker");
    if (hasActive || hasInactive) {
      throw new WarningError(
        `O recurso de anti-lottie-sticker já está ${
          antiLottieStickerOn ? "ativado" : "desativado"
        }!`,
      );
    }
    updateIsActiveGroupRestriction(
      remoteJid,
      "anti-lottieSticker",
      antiLottieStickerOn,
    );
    const status = antiLottieStickerOn ? "ativado" : "desativado";
    await sendSuccessReply(`Anti-lottie-sticker ${status} com sucesso!`);
  },
};
