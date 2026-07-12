import { BOT_LID, OWNER_LID } from "../config.js";
import { isAdmin, isLink } from "../middlewares/index.js";
import { errorLog } from "./logger.js";

const MAX_SCAN_DEPTH = 8;
const MESSAGE_WRAPPER_KEYS = [
  "ephemeralMessage",
  "viewOnceMessage",
  "viewOnceMessageV2",
  "viewOnceMessageV2Extension",
  "documentWithCaptionMessage",
  "statusMentionMessage",
  "groupStatusMentionMessage",
  "groupStatusMessage",
  "groupStatusMessageV2",
];

function canScanObject(value) {
  return (
    value &&
    typeof value === "object" &&
    !(value instanceof ArrayBuffer) &&
    !ArrayBuffer.isView(value)
  );
}

function getMessageText(message, depth = 0) {
  if (!canScanObject(message) || depth > MAX_SCAN_DEPTH) {
    return "";
  }

  const directText =
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    message.documentMessage?.caption ||
    "";

  if (directText) {
    return directText;
  }

  for (const key of MESSAGE_WRAPPER_KEYS) {
    const text = getMessageText(message[key]?.message, depth + 1);

    if (text) {
      return text;
    }
  }

  return "";
}

function findQuotedLinkContext(value, depth = 0, seenObjects = new WeakSet()) {
  if (
    !canScanObject(value) ||
    depth > MAX_SCAN_DEPTH ||
    seenObjects.has(value)
  ) {
    return null;
  }

  seenObjects.add(value);

  const contextInfo = value.contextInfo;
  const quotedText = getMessageText(contextInfo?.quotedMessage);

  if (
    canScanObject(contextInfo) &&
    typeof contextInfo.participant === "string" &&
    isLink(quotedText)
  ) {
    return {
      participant: contextInfo.participant,
      stanzaId:
        typeof contextInfo.stanzaId === "string"
          ? contextInfo.stanzaId
          : undefined,
    };
  }

  for (const [key, childValue] of Object.entries(value)) {
    if (key === "quotedMessage") {
      continue;
    }

    const found = findQuotedLinkContext(childValue, depth + 1, seenObjects);

    if (found) {
      return found;
    }
  }

  return null;
}

export function getQuotedLinkContext(webMessage) {
  return findQuotedLinkContext(webMessage?.message);
}

export async function handleQuotedLinkRestriction({
  socket,
  remoteJid,
  webMessage,
}) {
  const quotedLink = getQuotedLinkContext(webMessage);

  if (!quotedLink?.participant) {
    return false;
  }

  const authorLid = quotedLink.participant;

  if (authorLid === BOT_LID || authorLid === OWNER_LID) {
    return false;
  }

  try {
    const { participants } = await socket.groupMetadata(remoteJid);
    const authorInGroup = participants.some(
      (participant) => participant.id === authorLid,
    );

    if (
      !authorInGroup ||
      (await isAdmin({ remoteJid, userLid: authorLid, socket }))
    ) {
      return false;
    }

    await socket.groupParticipantsUpdate(remoteJid, [authorLid], "remove");

    if (quotedLink.stanzaId) {
      await socket.sendMessage(remoteJid, {
        delete: {
          remoteJid,
          fromMe: false,
          id: quotedLink.stanzaId,
          participant: authorLid,
        },
      });
    }

    return true;
  } catch (error) {
    errorLog(
      `Erro ao aplicar anti-link por marcação. Verifique se eu estou como admin do grupo! Detalhes: ${error.message}`,
    );
    return false;
  }
}
