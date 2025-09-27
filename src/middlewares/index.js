/**
 * Interceptadores diversos.
 *
 * @author Dev Gui
 */
const { delay } = require("baileys");
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

  const ipPattern =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  if (ipPattern.test(cleanText.split("/")[0])) {
    return true;
  }

  const urlPattern =
    /(https?:\/\/)?(www\.)?[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}(\/[^\s]*)?/g;

  const matches = cleanText.match(urlPattern);

  if (!matches || matches.length === 0) {
    return false;
  }

  const fileExtensions =
    /\.(txt|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|exe|jpg|jpeg|png|gif|mp4|mp3|avi)$/i;

  return matches.some((match) => {
    const cleanMatch = match.replace(/^https?:\/\//, "").replace(/^www\./, "");

    const matchIndex = cleanText.indexOf(match);
    const beforeMatch = cleanText.substring(0, matchIndex);
    const afterMatch = cleanText.substring(matchIndex + match.length);

    const charBefore = beforeMatch.slice(-1);
    const charAfter = afterMatch.slice(0, 1);

    if (
      charBefore &&
      /[a-zA-Z0-9]/.test(charBefore) &&
      !/[\s\.\,\:\;\!\?\(\)\[\]\{\}]/.test(charBefore)
    ) {
      return false;
    }

    if (
      charAfter &&
      /[a-zA-Z0-9]/.test(charAfter) &&
      !/[\s\.\,\:\;\!\?\(\)\[\]\{\}\/]/.test(charAfter)
    ) {
      return false;
    }

    if (/\s/.test(cleanMatch)) {
      return false;
    }

    if (fileExtensions.test(cleanMatch)) {
      return false;
    }

    const domainPart = cleanMatch.split("/")[0];
    if (domainPart.split(".").length < 2) {
      return false;
    }

    const parts = domainPart.split(".");
    const extension = parts[parts.length - 1];
    if (extension.length < 2) {
      return false;
    }

    try {
      const url = new URL("https://" + cleanMatch);
      return url.hostname.includes(".") && url.hostname.length > 4;
    } catch {
      return false;
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
    await delay(200);

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
