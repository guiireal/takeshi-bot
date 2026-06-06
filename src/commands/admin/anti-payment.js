import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import {
  isActiveGroupRestriction,
  updateIsActiveGroupRestriction,
} from "../../utils/database.js";
import { isFalse, isTrue } from "../../utils/index.js";

export default {
  name: "anti-payment",
  description:
    "Ativa/desativa o recurso de anti-payment no grupo, fechando o grupo, removendo o autor e limpando o chat. " +
    "Inclui detecção de cobranças *ocultas* (stealth): mensagens de pagamento indecifráveis/direcionadas que admins e o bot não conseguem ver também removem o autor automaticamente.",
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
    const antiPaymentOn = isTrue(args[0]);
    const antiPaymentOff = isFalse(args[0]);
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
    const stealthNote = antiPaymentOn
      ? "\n\n🛡️ Proteção *stealth* ligada: cobranças ocultas (indecifráveis/direcionadas) também são detectadas e removem o autor automaticamente."
      : "";
    await sendSuccessReply(`Anti-payment ${status} com sucesso!${stealthNote}`);
  },
};
