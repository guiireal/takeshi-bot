import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import {
  isActiveGroupRestriction,
  updateIsActiveGroupRestriction,
} from "../../utils/database.js";
import { isFalse, isTrue } from "../../utils/index.js";

export default {
  name: "anti-stealth",
  description:
    "Ativa/desativa o recurso de anti-stealth no grupo, punindo quem envia mensagem invisível (que o bot não consegue ler): fecha o grupo, remove o autor, apaga as mensagens e limpa o chat.",
  commands: ["anti-stealth", "anti-invisivel", "anti-msg-invisivel"],
  usage: `${PREFIX}anti-stealth (1/0)`,
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
    const antiStealthOn = isTrue(args[0]);
    const antiStealthOff = isFalse(args[0]);
    if (!antiStealthOn && !antiStealthOff) {
      throw new InvalidParameterError(
        "Você precisa digitar 1 ou 0 (ligar ou desligar)!",
      );
    }
    const hasActive =
      antiStealthOn && isActiveGroupRestriction(remoteJid, "anti-stealth");
    const hasInactive =
      antiStealthOff && !isActiveGroupRestriction(remoteJid, "anti-stealth");
    if (hasActive || hasInactive) {
      throw new WarningError(
        `O recurso de anti-stealth já está ${
          antiStealthOn ? "ativado" : "desativado"
        }!`,
      );
    }
    updateIsActiveGroupRestriction(remoteJid, "anti-stealth", antiStealthOn);
    const status = antiStealthOn ? "ativado" : "desativado";
    await sendSuccessReply(`Anti-stealth ${status} com sucesso!`);
  },
};
