/**
 * Evento chamado quando um usuário
 * entra ou sai de um grupo de WhatsApp.
 *
 * @author Dev Gui
 */
import {
  getExitMessage,
  getWelcomeMessage,
  isActiveExitGroup,
  isActiveGroup,
  isActiveWelcomeGroup,
} from "../utils/database.js";
import { extractUserLid, onlyNumbers } from "../utils/index.js";
import { errorLog } from "../utils/logger.js";

function applyMemberPlaceholder(template, userLid) {
  const hasMemberMention = template.includes("@member");
  const mentions = [];
  let text = template;

  if (hasMemberMention) {
    const userNumber = onlyNumbers(userLid);
    text = template.replaceAll("@member", `@${userNumber}`);
    mentions.push(userLid);
  }

  return { text, mentions };
}

export async function onGroupParticipantsUpdate({
  data,
  remoteJid,
  socket,
  action,
}) {
  try {
    if (!remoteJid.endsWith("@g.us")) {
      return;
    }

    if (!isActiveGroup(remoteJid)) {
      return;
    }

    const userLid = extractUserLid(data);

    if (isActiveWelcomeGroup(remoteJid) && action === "add") {
      const { text, mentions } = applyMemberPlaceholder(
        getWelcomeMessage(),
        userLid,
      );

      await socket.sendMessage(remoteJid, {
        text,
        mentions,
      });
    } else if (isActiveExitGroup(remoteJid) && action === "remove") {
      const { text, mentions } = applyMemberPlaceholder(
        getExitMessage(),
        userLid,
      );

      await socket.sendMessage(remoteJid, {
        text,
        mentions,
      });
    }
  } catch (error) {
    errorLog(`Erro em onGroupParticipantsUpdate: ${error.message}`);
    errorLog(JSON.stringify(error, null, 2));
  }
}
