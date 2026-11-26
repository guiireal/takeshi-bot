/**
 * Validador de mensagens
 *
 * @author Dev Gui
 */
import { unwrapMessage } from "zapo-js";
import { BOT_LID, OWNER_LID } from "../config.js";
import { getAudioStickerAudio } from "../utils/audioSticker.js";
import {
  applyAntiPaymentRestriction,
  handleQuotedPaymentRestriction,
} from "../utils/antiPaymentAction.js";
import { handleQuotedLinkRestriction } from "../utils/quotedLinkAction.js";
import {
  readGroupRestrictions,
  readRestrictedMessageTypes,
} from "../utils/database.js";
import { hasGroupStatusMessage } from "../utils/groupStatusMessage.js";
import { hasDirectMedia } from "../utils/index.js";
import { errorLog } from "../utils/logger.js";
import { hasPaymentMessage } from "../utils/paymentMessage.js";
import { isAdmin } from "./index.js";

export async function messageHandler(socket, webMessage) {
  try {
    if (!webMessage?.key) {
      return;
    }

    const { remoteJid, fromMe, id: messageId } = webMessage.key;

    if (!remoteJid?.endsWith("@g.us")) {
      return;
    }

    if (fromMe) {
      return;
    }

    const userLid = webMessage.key?.participant || webMessage.key?.participantAlt;

    if (!userLid) {
      return;
    }

    const isBotOrOwner = userLid === OWNER_LID || userLid === BOT_LID;

    if (isBotOrOwner) {
      return;
    }

    const antiGroups = readGroupRestrictions();
    const isAntiLinkActive = !!antiGroups[remoteJid]?.["anti-link"];
    const isAntiPaymentActive = !!antiGroups[remoteJid]?.["anti-payment"];

    if (
      isAntiLinkActive &&
      (await handleQuotedLinkRestriction({ socket, remoteJid, webMessage }))
    ) {
      return;
    }

    const userIsAdmin = await isAdmin({ remoteJid, userLid, socket });

    if (userIsAdmin) {
      return;
    }

    if (isAntiPaymentActive && hasPaymentMessage(webMessage)) {
      await applyAntiPaymentRestriction({
        socket,
        remoteJid,
        userLid,
        messageKey: {
          remoteJid,
          fromMe: false,
          id: messageId,
          participant: userLid,
        },
      });

      return;
    }

    if (
      isAntiPaymentActive &&
      (await handleQuotedPaymentRestriction({ socket, remoteJid, webMessage }))
    ) {
      return;
    }

    if (
      antiGroups[remoteJid]?.["anti-status-grupo"] &&
      hasGroupStatusMessage(webMessage)
    ) {
      try {
        await socket.groupParticipantsUpdate(remoteJid, [userLid], "remove");

        // Status do grupo (stanza <status>) não some com revogação enviada pela
        // zapo (testado em 18/11/2026): tentar apagar à toa parece abuso, só bane.
        if (!webMessage.message?.groupStatusMessageV2) {
          await socket.sendMessage(remoteJid, {
            delete: webMessage.key,
          });
        }
      } catch (error) {
        errorLog(
          `Erro ao aplicar anti-status-grupo. Verifique se eu estou como admin do grupo! Detalhes: ${error.message}`,
        );
      }
      return;
    }

    // Figurinha com áudio chega sem stickerMessage (só o campo 134 desconhecido),
    // então o hasDirectMedia abaixo não a enxerga: checa antes, pelo áudio.
    const isAudioSticker =
      !!antiGroups[remoteJid]?.["anti-sticker-audio"] &&
      !!getAudioStickerAudio(
        unwrapMessage(webMessage.message) || webMessage.message,
      );

    const messageType = Object.keys(readRestrictedMessageTypes()).find((type) =>
      hasDirectMedia(webMessage, type)
    );

    if (!isAudioSticker && !messageType) {
      return;
    }

    if (!isAudioSticker && !antiGroups[remoteJid]?.[`anti-${messageType}`]) {
      return;
    }

    await socket.sendMessage(remoteJid, {
      delete: {
        remoteJid,
        fromMe,
        id: messageId,
        participant: userLid,
      },
    });
  } catch (error) {
    errorLog(
      `Erro ao processar mensagem restrita. Verifique se eu estou como admin do grupo! Detalhes: ${error.message}`
    );
  }
}
