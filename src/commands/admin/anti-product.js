const {
  updateIsActiveGroupRestriction,
} = require(`${BASE_DIR}/utils/database`);

const { isActiveGroupRestriction } = require(`${BASE_DIR}/utils/database`);

const { WarningError } = require(`${BASE_DIR}/errors`);
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "anti-product",
  description:
    "Ativa/desativa o recurso de anti-product no grupo, apagando a mensagem de produto se estiver ativo.",
  commands: ["anti-product", "anti-produto", "anti-produtos"],
  usage: `${PREFIX}anti-product (1/0)`,
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

    const antiProductOn = args[0] == "1";
    const antiProductOff = args[0] == "0";

    if (!antiProductOn && !antiProductOff) {
      throw new InvalidParameterError(
        "Você precisa digitar 1 ou 0 (ligar ou desligar)!"
      );
    }

    const hasActive =
      antiProductOn && isActiveGroupRestriction(remoteJid, "anti-product");

    const hasInactive =
      antiProductOff && !isActiveGroupRestriction(remoteJid, "anti-product");

    if (hasActive || hasInactive) {
      throw new WarningError(
        `O recurso de anti-product já está ${
          antiProductOn ? "ativado" : "desativado"
        }!`
      );
    }

    updateIsActiveGroupRestriction(remoteJid, "anti-product", antiProductOn);

    const status = antiProductOn ? "ativado" : "desativado";

    await sendSuccessReply(`Anti-product ${status} com sucesso!`);
  },
};
