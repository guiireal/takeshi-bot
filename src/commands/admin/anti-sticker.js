const {
  updateIsActiveGroupRestriction,
} = require(`${BASE_DIR}/utils/database`);

const { isActiveGroupRestriction } = require(`${BASE_DIR}/utils/database`);

const { InvalidParameterError, WarningError } = require(`${BASE_DIR}/errors`);
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "anti-sticker",
  description:
    "Ativa/desativa o recurso de anti-sticker no grupo, apagando a figurinha se estiver ativo.",
  commands: ["anti-sticker", "anti-figu", "anti-figurinha", "anti-figurinhas"],
  usage: `${PREFIX}anti-sticker (1/0)`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
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

    const antiStickerOn = args[0] == "1";
    const antiStickerOff = args[0] == "0";

    if (!antiStickerOn && !antiStickerOff) {
      throw new InvalidParameterError(
        "Você precisa digitar 1 ou 0 (ligar ou desligar)!"
      );
    }

    const hasActive =
      antiStickerOn && isActiveGroupRestriction(remoteJid, "anti-sticker");

    const hasInactive =
      antiStickerOff && !isActiveGroupRestriction(remoteJid, "anti-sticker");

    if (hasActive || hasInactive) {
      throw new WarningError(
        `O recurso de anti-sticker já está ${
          antiStickerOn ? "ativado" : "desativado"
        }!`
      );
    }

    updateIsActiveGroupRestriction(remoteJid, "anti-sticker", antiStickerOn);

    const status = antiStickerOn ? "ativado" : "desativado";

    await sendSuccessReply(`Anti-sticker ${status} com sucesso!`);
  },
};
