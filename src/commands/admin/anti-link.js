import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import {
  activateAntiLinkGroup,
  deactivateAntiLinkGroup,
  isActiveAntiLinkGroup,
} from "../../utils/database.js";

export default {
  name: "anti-link",
  description: "Ativo/desativo o recurso de anti-link no grupo.",
  commands: ["anti-link"],
  usage: `${PREFIX}anti-link (1/0)`,
  /**
   * @param {CommandHandleProps} props
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
