/**
 * Este script é responsável
 * por carregar os eventos
 * que serão escutados pelo
 * cliente do WhatsApp.
 *
 * @author Dev Gui
 */
import { customMiddleware } from "./middlewares/customMiddleware.js";
import { onCall } from "./middlewares/onCall.js";
import { onGroupParticipantsUpdate } from "./middlewares/onGroupParticipantsUpdate.js";
import { onMessage } from "./middlewares/onMessage.js";
import { createSocketAdapter } from "./services/wa.js";
import { badMacHandler } from "./utils/badMacHandler.js";
import { errorLog } from "./utils/logger.js";

export function load(client) {
  const socket = createSocketAdapter(client);

  const safeEventHandler = async (callback, eventName) => {
    try {
      await callback();
    } catch (error) {
      if (badMacHandler.handleError(error, eventName)) {
        return;
      }
      errorLog(`Erro ao processar evento ${eventName}: ${error.message}`);
      if (error.stack) {
        errorLog(`Stack trace: ${error.stack}`);
      }
    }
  };

  client.on("message", async (event) => {
    const startProcess = Date.now();

    safeEventHandler(
      () => onMessage({ socket, event, startProcess }),
      "message",
    );
  });

  client.on("call", async (event) => {
    const call = {
      id: event.callId,
      from: event.callerPnJid ?? event.callCreatorJid,
      status: event.type,
      isGroup: !!event.groupJid,
      groupJid: event.groupJid,
    };

    safeEventHandler(() => onCall({ socket, calls: [call] }), "call");
  });

  client.on("group", async (event) => {
    if (event.action !== "add" && event.action !== "remove") {
      return;
    }

    for (const participant of event.participants || []) {
      safeEventHandler(async () => {
        await customMiddleware({
          socket,
          webMessage: null,
          type: "participant",
          action: event.action,
          data: participant.jid,
          commonFunctions: null,
        });

        await onGroupParticipantsUpdate({
          data: participant.jid,
          remoteJid: event.groupJid,
          socket,
          action: event.action,
        });
      }, "group");
    }
  });

  process.on("uncaughtException", (error) => {
    if (badMacHandler.handleError(error, "uncaughtException")) {
      return;
    }
    errorLog(`Erro não capturado: ${error.message}`);
  });

  process.on("unhandledRejection", (reason) => {
    if (badMacHandler.handleError(reason, "unhandledRejection")) {
      return;
    }
    errorLog(`Promessa rejeitada não tratada: ${reason}`);
  });
}
