const { isActiveAntiLinkGroup } = require("../../utils/database");

const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError, WarningError } = require(`${BASE_DIR}/errors`);
const {
  activateAntiLinkGroup,
  deactivateAntiLinkGroup,
} = require(`${BASE_DIR}/utils/database`);

module.exports = {
  name: "anti-link",
  description: "Ativo/desativo o recurso de anti-link no grupo.",
  commands: ["anti-link"],
  usage: `${PREFIX}anti-link (1/0)`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ args, sendReply, sendSuccessReact, remoteJid }) => {
    if (!args.length) {
      throw new InvalidParameterError(
        "Você precisa digitar 1 ou 0 (ligar ou desligar)!"
      );
    }

    const antiLinkOn = args[0] == "1";
    const antiLinkOff = args[0] == "0";

    if (!antiLinkOn && !antiLinkOff) {
      throw new InvalidParameterError(
        "Você precisa digitar 1 ou 0 (ligar ou desligar)!"
      );
    }

    const hasActive = antiLinkOn && isActiveAntiLinkGroup(remoteJid);
    const hasInactive = antiLinkOff && !isActiveAntiLinkGroup(remoteJid);

    if (hasActive || hasInactive) {
      throw new WarningError(
        `O recurso de anti-link já está ${
          antiLinkOn ? "ativado" : "desativado"
        }!`
      );
    }

    if (antiLinkOn) {
      activateAntiLinkGroup(remoteJid);
    } else {
      deactivateAntiLinkGroup(remoteJid);
    }

    await sendSuccessReact();

    const context = antiLinkOn ? "ativado" : "desativado";

    await sendReply(`Recurso de anti-link ${context} com sucesso!`);
  },
};
