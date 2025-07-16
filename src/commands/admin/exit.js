const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError, WarningError } = require(`${BASE_DIR}/errors`);
const {
  activateExitGroup,
  deactivateExitGroup,
  isActiveExitGroup,
} = require(`${BASE_DIR}/utils/database`);

module.exports = {
  name: "exit",
  description:
    "Ativo/desativo o recurso de envio de mensagem quando alguém sai do grupo.",
  commands: ["exit", "saida"],
  usage: `${PREFIX}exit (1/0)`,
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

    const exit = args[0] == "1";
    const notExit = args[0] == "0";

    if (!exit && !notExit) {
      throw new InvalidParameterError(
        "Você precisa digitar 1 ou 0 (ligar ou desligar)!"
      );
    }

    const hasActive = exit && isActiveExitGroup(remoteJid);
    const hasInactive = notExit && !isActiveExitGroup(remoteJid);

    if (hasActive || hasInactive) {
      throw new WarningError(
        `O recurso de saída já está ${exit ? "ativado" : "desativado"}!`
      );
    }

    if (exit) {
      activateExitGroup(remoteJid);
    } else {
      deactivateExitGroup(remoteJid);
    }

    await sendSuccessReact();

    const context = exit ? "ativado" : "desativado";

    await sendReply(
      `Recurso de envio de mensagem de saída ${context} com sucesso!`
    );
  },
};
