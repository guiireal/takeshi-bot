/**
 * Evento chamado quando uma mensagem
 * é recebida no grupo do WhatsApp.
 *
 * Entrada/saída de participantes NÃO passa mais por aqui:
 * o zapo emite isso como um evento "group" próprio, tratado
 * diretamente em loader.js.
 *
 * @author Dev Gui
 */
import { DEVELOPER_MODE } from "../config.js";
import { badMacHandler } from "../utils/badMacHandler.js";
import { checkIfMemberIsMuted } from "../utils/database.js";
import { dynamicCommand } from "../utils/dynamicCommand.js";
import { isAtLeastMinutesInPast } from "../utils/index.js";
import { loadCommonFunctions } from "../utils/loadCommonFunctions.js";
import { errorLog, infoLog } from "../utils/logger.js";
import { recordMessageEnvelope } from "../utils/messageEnvelopeRegistry.js";
import { hasPaymentMessage } from "../utils/paymentMessage.js";
import { handleAfkReferences } from "./afkHandler.js";
import { customMiddleware } from "./customMiddleware.js";
import { messageHandler } from "./messageHandler.js";

export async function onMessage({ socket, event, startProcess }) {
  if (!event) {
    return;
  }

  const webMessage = event;

  if (DEVELOPER_MODE) {
    infoLog(
      `\n\n⪨========== [ MENSAGEM RECEBIDA ] ==========⪩ \n\n${JSON.stringify(
        webMessage,
      )}`,
    );
  }

  try {
    if (!webMessage?.key?.remoteJid?.endsWith("@g.us")) {
      return;
    }

    const timestamp = webMessage.timestampSeconds;

    // Registra o envelope (id -> autor/estado) de TODA mensagem de grupo,
    // para corroborar marcações de pagamento e impedir forja (banir inocente).
    recordMessageEnvelope(webMessage, hasPaymentMessage(webMessage));

    if (webMessage?.message) {
      messageHandler(socket, webMessage);
    }

    if (isAtLeastMinutesInPast(timestamp)) {
      return;
    }

    if (
      checkIfMemberIsMuted(
        webMessage?.key?.remoteJid,
        webMessage?.key?.participant?.replace(/:[0-9][0-9]|:[0-9]/g, ""),
      )
    ) {
      try {
        const { id, remoteJid, participant } = webMessage.key;

        const deleteKey = {
          remoteJid,
          fromMe: false,
          id,
          participant,
        };

        await socket.sendMessage(remoteJid, { delete: deleteKey });
      } catch (error) {
        errorLog(
          `Erro ao deletar mensagem de membro silenciado, provavelmente eu não sou administrador do grupo! ${error.message}`,
        );
      }

      return;
    }

    const commonFunctions = loadCommonFunctions({ socket, webMessage });

    if (!commonFunctions) {
      return;
    }

    await customMiddleware({
      socket,
      webMessage,
      type: "message",
      commonFunctions,
    });

    await handleAfkReferences({ webMessage, commonFunctions });

    await dynamicCommand(commonFunctions, startProcess);
  } catch (error) {
    if (badMacHandler.handleError(error, "message-processing")) {
      return;
    }

    if (badMacHandler.isSessionError(error)) {
      errorLog(`Erro de sessão ao processar mensagem: ${error.message}`);
      return;
    }

    errorLog(
      `Erro ao processar mensagem: ${error.message} | Stack: ${error.stack}`,
    );
  }
}
