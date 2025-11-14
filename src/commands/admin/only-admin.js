import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import {
  activateOnlyAdmins,
  deactivateOnlyAdmins,
  isActiveOnlyAdmins,
} from "../../utils/database.js";

export default {
  name: "only-admin",
  description: "Permite que só administradores utilizem meus comandos.",
  commands: [
    "only-admin",
    "only-adm",
    "only-administrator",
    "only-administrators",
    "only-admins",
    "so-adm",
    "so-admin",
    "so-administrador",
    "so-administradores",
    "so-admins",
  ],
  usage: `${PREFIX}only-admin 1`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, sendReply, sendSuccessReact, remoteJid }) => {
    if (!args.length) {
      throw new InvalidParameterError(
        "Você precisa digitar 1 ou 0 (ligar ou desligar)!"
      );
    }
    const onlyAdminOn = args[0] == "1";
    const onlyAdminOff = args[0] == "0";
    if (!onlyAdminOn && !onlyAdminOff) {
      throw new InvalidParameterError(
        "Você precisa digitar 1 ou 0 (ligar ou desligar)!"
      );
    }
    const hasActive = onlyAdminOn && isActiveOnlyAdmins(remoteJid);
    const hasInactive = onlyAdminOff && !isActiveOnlyAdmins(remoteJid);
    if (hasActive || hasInactive) {
      throw new WarningError(
        `O recurso de somente admins usarem meus comandos já está ${
          onlyAdminOn ? "ativado" : "desativado"
        }!`
      );
    }
    if (onlyAdminOn) {
      activateOnlyAdmins(remoteJid);
    } else {
      deactivateOnlyAdmins(remoteJid);
    }
    await sendSuccessReact();
    const context = onlyAdminOn ? "ativado" : "desativado";
    await sendReply(
      `Recurso de somente admins usarem meus comandos ${context} com sucesso!`
    );
  },
};
