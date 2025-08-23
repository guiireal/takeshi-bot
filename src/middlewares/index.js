/**
 * Interceptadores diversos.
 *
 * @author Dev Gui
 */
const { OWNER_NUMBER, OWNER_LID } = require("../config");
const { compareUserJidWithOtherNumber } = require("../utils");
const { getPrefix } = require("../utils/database");

exports.verifyPrefix = (prefix, groupJid) => {
  const groupPrefix = getPrefix(groupJid);

  return groupPrefix === prefix;
};

exports.hasTypeAndCommand = ({ type, command }) => !!type && !!command;

exports.isLink = (text) => {
  const cleanText = text.trim();

  if (/^\d+$/.test(cleanText)) {
    return false;
  }

  if (/[.]{2,3}/.test(cleanText)) {
    return false;
  }

  const words = cleanText.split(/\s+/);
  const possibleDomains = words.filter(
    (word) => word.includes(".") && !word.startsWith(".") && !word.endsWith(".")
  );

  if (possibleDomains.length === 0) {
    return false;
  }

  return possibleDomains.some((domain) => {
    try {
      const url = new URL("https://" + domain);
      return url.hostname.includes(".") && url.hostname.length > 4;
    } catch {
      try {
        const url = new URL("https://" + cleanText);

        const originalHostname = cleanText
          .split("/")[0]
          .split("?")[0]
          .split("#")[0];

        const hostnameWithoutTrailingDot = originalHostname.replace(/\.$/, "");

        return (
          url.hostname.includes(".") &&
          hostnameWithoutTrailingDot.includes(".") &&
          url.hostname.length > 4 &&
          !/^\d+$/.test(originalHostname)
        );
      } catch (error) {
        return false;
      }
    }
  });
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
    compareUserJidWithOtherNumber({
      userJid: participant.id,
      otherNumber: OWNER_NUMBER,
    });

  const isAdmin = participant.admin === "admin";

  return isOwner || isAdmin;
};

exports.isBotOwner = ({ userJid, isLid }) => {
  if (isLid) {
    return userJid === OWNER_LID;
  }

  return compareUserJidWithOtherNumber({
    userJid: userJid,
    otherNumber: OWNER_NUMBER,
  });
};

exports.checkPermission = async ({ type, socket, userJid, remoteJid }) => {
  if (type === "member") {
    return true;
  }

  try {
    const { participants, owner } = await socket.groupMetadata(remoteJid);

    const participant = participants.find(
      (participant) => participant.id === userJid
    );

    if (!participant) {
      return false;
    }

    const isOwner =
      participant.id === owner || participant.admin === "superadmin";

    const isAdmin = participant.admin === "admin";

    const isBotOwner =
      compareUserJidWithOtherNumber({ userJid, otherNumber: OWNER_NUMBER }) ||
      userJid === OWNER_LID;

    if (type === "admin") {
      return isOwner || isAdmin || isBotOwner;
    }

    if (type === "owner") {
      return isOwner || isBotOwner;
    }

    return false;
  } catch (error) {
    return false;
  }
};
