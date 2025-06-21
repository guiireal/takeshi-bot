/**
 * Interceptadores diversos.
 *
 * @author Dev Gui
 */
const { PREFIX, OWNER_NUMBER } = require("../config");
const { toUserJid } = require("../utils");

exports.verifyPrefix = (prefix) => PREFIX === prefix;
exports.hasTypeOrCommand = ({ type, command }) => type && command;

exports.isLink = (text) => {
  const cleanText = text.trim();

  try {
    const url = new URL(cleanText);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (error) {
    try {
      const url = new URL("https://" + cleanText);
      return url.hostname.includes(".");
    } catch (error) {
      return false;
    }
  }
};

exports.isAdmin = async ({ remoteJid, userJid, socket }) => {
  const { participants, owner } = await socket.groupMetadata(remoteJid);

  const participant = participants.find(
    (participant) => participant.id === userJid
  );

  if (!participant) {
    return false;
  }

  const isOwner =
    participant.id === owner ||
    participant.admin === "superadmin" ||
    participant.id === toUserJid(OWNER_NUMBER);

  const isAdmin = participant.admin === "admin";

  return isOwner || isAdmin;
};
