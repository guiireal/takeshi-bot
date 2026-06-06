import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import {
  isActiveGroupRestriction,
  updateIsActiveGroupRestriction,
} from "../../utils/database.js";
import { isFalse, isTrue } from "../../utils/index.js";

export default {
  name: "anti-document",
  description:
    "Ativa/desativa o recurso de anti-document no grupo, apagando a mensagem de documento se estiver ativo.",
  commands: ["anti-document", "anti-doc", "anti-documento", "anti-documentos"],
  usage: `${PREFIX}anti-document (1/0)`,
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
    isTrue(args[0]);
    const antiDocumentOff = isFalse(args[0]);
    const antiDocumentOff = args[0] == "0";
    if (!antiDocumentOn && !antiDocumentOff) {
      throw new InvalidParameterError(
        "Você precisa digitar 1 ou 0 (ligar ou desligar)!",
      );
    }
    const hasActive =
      antiDocumentOn && isActiveGroupRestriction(remoteJid, "anti-document");
    const hasInactive =
      antiDocumentOff && !isActiveGroupRestriction(remoteJid, "anti-document");
    if (hasActive || hasInactive) {
      throw new WarningError(
        `O recurso de anti-document já está ${
          antiDocumentOn ? "ativado" : "desativado"
        }!`,
      );
    }
    updateIsActiveGroupRestriction(remoteJid, "anti-document", antiDocumentOn);
    const status = antiDocumentOn ? "ativado" : "desativado";
    await sendSuccessReply(`Anti-document ${status} com sucesso!`);
  },
};
