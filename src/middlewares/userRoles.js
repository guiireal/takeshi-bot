const { toUserJid } = require("../utils");
const { OWNER_NUMBER } = require("../config");

const ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  BOT_OWNER: 'BOT_OWNER'
};

exports.getUserRole = async ({ socket, userJid, remoteJid }) => {
  if (userJid === toUserJid(OWNER_NUMBER) || userJid === OWNER_LID) {
    return ROLES.BOT_OWNER;
  }

  try {
    const { participants, owner } = await socket.groupMetadata(remoteJid);
    const participant = participants.find(p => p.id === userJid);

    if (!participant) return ROLES.MEMBER;

    if (participant.id === owner || participant.admin === "superadmin") {
      return ROLES.OWNER;
    }

    if (participant.admin === "admin") {
      return ROLES.ADMIN;
    }

    return ROLES.MEMBER;
  } catch (error) {
    return ROLES.MEMBER;
  }
};

exports.ROLES = ROLES;