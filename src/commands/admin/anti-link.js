const { PREFIX } = require("../../config");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");
const {
  activateAntiLinkGroup,
  deactivateAntiLinkGroup,
} = require("../../utils/database");

module.exports = {
  name: "anti-link",
  description: "Ativo/desativo o recurso de anti-link no grupo.",
  commands: ["anti-link"],
  usage: `${PREFIX}anti-link (1/0)`,
  handle: async ({ args, sendReply, sendSuccessReact, remoteJid }) => {
    if (!args.length) {
      throw new InvalidParameterError(
        "Você precisa digitar 1 ou 0 (ligar ou desligar)!"
      );
    }

    const autoResponder = args[0] === "1";
    const notAutoResponder = args[0] === "0";

    if (!autoResponder && !notAutoResponder) {
      throw new InvalidParameterError(
        "Você precisa digitar 1 ou 0 (ligar ou desligar)!"
      );
    }

    if (autoResponder) {
      activateAntiLinkGroup(remoteJid);
    } else {
      deactivateAntiLinkGroup(remoteJid);
    }

    await sendSuccessReact();

    const context = autoResponder ? "ativado" : "desativado";

    await sendReply(`Recurso de anti-link ${context} com sucesso!`);
  },
};
