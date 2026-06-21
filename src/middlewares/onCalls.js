import { BOT_EMOJI, BOT_LID, OWNER_LID } from "../config.js";
import { isActiveGroupRestriction } from "../utils/database.js";
import { errorLog } from "../utils/logger.js";
import { isAdmin } from "./index.js";

const ANTI_CALL_MESSAGE = `${BOT_EMOJI} 📵 Ligações são proibidas neste grupo!`;

function getCallAuthor(call) {
  return call.from || call.chatId || call.callerPn;
}

async function handleCall({ socket, call }) {
  if (!call?.isGroup || !call?.groupJid) {
    return;
  }

  const remoteJid = call.groupJid;

  if (!isActiveGroupRestriction(remoteJid, "anti-call")) {
    return;
  }

  const userLid = getCallAuthor(call);

  if (!userLid || userLid === OWNER_LID || userLid === BOT_LID) {
    return;
  }

  const userIsAdmin = await isAdmin({ remoteJid, userLid, socket });

  if (userIsAdmin) {
    return;
  }

  await socket.groupParticipantsUpdate(remoteJid, [userLid], "remove");
  await socket.sendMessage(remoteJid, { text: ANTI_CALL_MESSAGE });
}

export async function onCalls({ socket, calls }) {
  if (!calls?.length) {
    return;
  }

  for (const call of calls) {
    try {
      await handleCall({ socket, call });
    } catch (error) {
      errorLog(
        `Erro ao aplicar anti-call. Verifique se eu estou como admin do grupo! Detalhes: ${error.message}`,
      );
    }
  }
}
