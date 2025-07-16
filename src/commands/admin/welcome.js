const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError, WarningError } = require(`${BASE_DIR}/errors`);
const {
  activateWelcomeGroup,
  deactivateWelcomeGroup,
  isActiveWelcomeGroup,
} = require(`${BASE_DIR}/utils/database`);

module.exports = {
  name: "welcome",
  description: "Ativo/desativo o recurso de boas-vindas no grupo.",
  commands: [
    "welcome",
    "bemvindo",
    "boasvinda",
    "boasvindas",
    "boavinda",
    "boavindas",
    "welkom",
    "welkon",
  ],
  usage: `${PREFIX}welcome (1/0)`,
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

    const welcome = args[0] == "1";
    const notWelcome = args[0] == "0";

    if (!welcome && !notWelcome) {
      throw new InvalidParameterError(
        "Você precisa digitar 1 ou 0 (ligar ou desligar)!"
      );
    }

    const hasActive = welcome && isActiveWelcomeGroup(remoteJid);
    const hasInactive = notWelcome && !isActiveWelcomeGroup(remoteJid);

    if (hasActive || hasInactive) {
      throw new WarningError(
        `O recurso de boas-vindas já está ${
          welcome ? "ativado" : "desativado"
        }!`
      );
    }

    if (welcome) {
      activateWelcomeGroup(remoteJid);
    } else {
      deactivateWelcomeGroup(remoteJid);
    }

    await sendSuccessReact();

    const context = welcome ? "ativado" : "desativado";

    await sendReply(`Recurso de boas-vindas ${context} com sucesso!`);
  },
};
