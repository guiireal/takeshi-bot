import { PREFIX } from "../../config.js";
import {
  DangerError,
  InvalidParameterError,
  WarningError,
} from "../../errors/index.js";
import {
  removeAfkMember,
  setAfkMember,
} from "../../utils/database.js";

const DISABLE_OPTIONS = ["off", "sair", "voltei"];

export default {
  name: "afk",
  description: "Informa que você está ausente e registra o motivo.",
  commands: ["afk", "ausente"],
  usage: `${PREFIX}afk <motivo> ou ${PREFIX}afk off`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    fullArgs,
    isGroup,
    remoteJid,
    sendSuccessReply,
    userLid,
  }) => {
    if (!isGroup) {
      throw new DangerError("Este comando só pode ser usado em grupos.");
    }

    const reason = fullArgs.trim();

    if (!reason) {
      throw new InvalidParameterError(
        `Informe o motivo da ausência.\n\nExemplo: ${PREFIX}afk ocupado`,
      );
    }

    if (DISABLE_OPTIONS.includes(reason.toLocaleLowerCase())) {
      const removed = removeAfkMember(remoteJid, userLid);

      if (!removed) {
        throw new WarningError("Você não está marcado como ausente.");
      }

      await sendSuccessReply("Seu status de ausência foi removido.");
      return;
    }

    setAfkMember(remoteJid, userLid, reason);

    await sendSuccessReply("Ausência cadastrada com sucesso!");
  },
};
