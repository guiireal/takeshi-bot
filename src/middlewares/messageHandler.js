/**
 * Validador de mensagens
 *
 * @author Dev Gui
 */
import { OWNER_LID } from "../config.js";
import {
  readGroupRestrictions,
  readRestrictedMessageTypes,
} from "../utils/database.js";
import { getContent } from "../utils/index.js";
import { errorLog } from "../utils/logger.js";

export async function messageHandler(socket, webMessage) {
  try {
    if (!webMessage?.key) {
      return;
    }

    const { remoteJid, fromMe, id: messageId } = webMessage.key;

    if (fromMe) {
      return;
    }

    const userLid = webMessage.key?.participant;

    if (!userLid) {
      return;
    }

    const isBotOrOwner = userLid === OWNER_LID;

    if (isBotOrOwner) {
      return;
    }

    const antiGroups = readGroupRestrictions();

    const messageType = Object.keys(readRestrictedMessageTypes()).find((type) =>
      getContent(webMessage, type)
    );

    if (!messageType) {
      return;
    }

    const isAntiActive = !!antiGroups[remoteJid]?.[`anti-${messageType}`];

    if (!isAntiActive) {
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
