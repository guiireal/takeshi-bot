/**
 * Mensagens de pagamento (requestPayment etc.) frequentemente não saem com
 * o delete admin normal. O fluxo cria uma mensagem auxiliar, força um edit
 * com o ID da payment e só então revoga o payload original.
 *
 * @author Dev Gui
 */
import { delay } from "baileys";
import { BOT_EMOJI } from "../config.js";
import { errorLog } from "./logger.js";

/**
 * @param {{
 *   socket: import("baileys").WASocket,
 *   remoteJid: string,
 *   messageKey: {
 *     remoteJid?: string,
 *     fromMe?: boolean,
 *     id: string,
 *     participant: string,
 *   },
 *   settleMs?: number,
 * }} params
 */
export async function deletePaymentMessage({
  socket,
  remoteJid,
  messageKey,
  settleMs = 400,
}) {
  const id = messageKey?.id;
  const participant = messageKey?.participant;

  if (!id || !participant) {
    throw new Error(
      "Não foi possível identificar a mensagem de pagamento para apagar!",
    );
  }

  try {
    const dummyMessage = await socket.sendMessage(remoteJid, {
      text: "\u200B",
    });
    const dummyMessageId = dummyMessage?.key?.id;

    if (!dummyMessageId) {
      throw new Error("Falha ao gerar ID auxiliar para apagar o pagamento");
    }

    await socket.sendMessage(
      remoteJid,
      {
        text: `${BOT_EMOJI} Mensagem de pagamento removida`,
        edit: {
          remoteJid,
          fromMe: true,
          id: dummyMessageId,
        },
      },
      { messageId: id },
    );

    await delay(settleMs);

    await socket.sendMessage(remoteJid, {
      delete: {
        remoteJid,
        id,
        fromMe: false,
        participant,
      },
    });

    await delay(settleMs);

    try {
      await socket.sendMessage(remoteJid, {
        delete: {
          remoteJid,
          id: dummyMessageId,
          fromMe: true,
        },
      });
    } catch {
      try {
        await socket.sendMessage(remoteJid, {
          delete: {
            remoteJid,
            id: dummyMessageId,
            fromMe: false,
            participant: socket.user?.id,
          },
        });
      } catch (cleanupError) {
        errorLog(
          `[payment-delete] Falha ao apagar mensagem auxiliar. Detalhes: ${
            cleanupError?.message || cleanupError
          }`,
        );
      }
    }
  } catch (error) {
    errorLog(
      `[payment-delete] Erro ao apagar pagamento. Detalhes: ${
        error?.message || error
      }`,
    );
    throw new Error(
      "Não foi possível apagar a mensagem de pagamento! Tente novamente.",
    );
  }
}

/**
 * Tenta o fluxo especial de payment e, se falhar, cai no delete admin normal.
 *
 * @param {{
 *   socket: import("baileys").WASocket,
 *   remoteJid: string,
 *   messageKey: {
 *     remoteJid?: string,
 *     fromMe?: boolean,
 *     id: string,
 *     participant: string,
 *   },
 *   settleMs?: number,
 * }} params
 */
export async function deletePaymentMessageWithFallback({
  socket,
  remoteJid,
  messageKey,
  settleMs = 400,
}) {
  try {
    await deletePaymentMessage({ socket, remoteJid, messageKey, settleMs });
  } catch (error) {
    errorLog(
      `[payment-delete] Fallback para delete normal. Detalhes: ${
        error?.message || error
      }`,
    );

    await socket.sendMessage(remoteJid, {
      delete: {
        remoteJid: messageKey?.remoteJid || remoteJid,
        fromMe: messageKey?.fromMe ?? false,
        id: messageKey?.id,
        participant: messageKey?.participant,
      },
    });
  }
}
