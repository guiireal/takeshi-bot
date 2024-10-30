const { PREFIX, OWNER_NUMBER } = require("../config");
const { toUserJid } = require("../utils");

exports.verifyPrefix = (prefix) => PREFIX === prefix;
exports.hasTypeOrCommand = ({ type, command }) => type && command;

exports.isLink = (text) => {
  const regex = /(https?:\/\/(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/\S*)?)/g;
  return regex.test(text);
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
