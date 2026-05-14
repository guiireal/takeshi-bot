import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import {
  isActiveGroupRestriction,
  updateIsActiveGroupRestriction,
} from "../../utils/database.js";

export default {
  name: "anti-payment",
  description:
    "Ativa/desativa o recurso de anti-payment no grupo, fechando o grupo, removendo o autor e limpando o chat.",
  commands: ["anti-payment", "anti-pagamento"],
  usage: `${PREFIX}anti-payment (1/0)`,
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
    const antiPaymentOn = args[0] == "1";
    const antiPaymentOff = args[0] == "0";
    if (!antiPaymentOn && !antiPaymentOff) {
      throw new InvalidParameterError(
        "Você precisa digitar 1 ou 0 (ligar ou desligar)!",
      );
    }
    const hasActive =
      antiPaymentOn && isActiveGroupRestriction(remoteJid, "anti-payment");
    const hasInactive =
      antiPaymentOff && !isActiveGroupRestriction(remoteJid, "anti-payment");
    if (hasActive || hasInactive) {
      throw new WarningError(
        `O recurso de anti-payment já está ${
          antiPaymentOn ? "ativado" : "desativado"
        }!`,
      );
    }
    updateIsActiveGroupRestriction(remoteJid, "anti-payment", antiPaymentOn);
    const status = antiPaymentOn ? "ativado" : "desativado";
    await sendSuccessReply(`Anti-payment ${status} com sucesso!`);
  },
};
