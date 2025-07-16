const {
  updateIsActiveGroupRestriction,
} = require(`${BASE_DIR}/utils/database`);

const { isActiveGroupRestriction } = require(`${BASE_DIR}/utils/database`);

const { WarningError } = require(`${BASE_DIR}/errors`);
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "anti-image",
  description:
    "Ativa/desativa o recurso de anti-image no grupo, apagando a mensagem de imagem se estiver ativo.",
  commands: ["anti-image", "anti-img", "anti-imagem", "anti-imagens"],
  usage: `${PREFIX}anti-image (1/0)`,
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

    const antiImageOn = args[0] == "1";
    const antiImageOff = args[0] == "0";

    if (!antiImageOn && !antiImageOff) {
      throw new InvalidParameterError(
        "Você precisa digitar 1 ou 0 (ligar ou desligar)!"
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
        }!`
      );
    }

    updateIsActiveGroupRestriction(remoteJid, "anti-image", antiImageOn);

    const status = antiImageOn ? "ativado" : "desativado";

    await sendSuccessReply(`Anti-image ${status} com sucesso!`);
  },
};
