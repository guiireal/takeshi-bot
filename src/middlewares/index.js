const { PREFIX } = require("../config");

exports.verifyPrefix = (prefix) => PREFIX === prefix;
exports.hasTypeOrCommand = ({ type, command }) => type && command;

exports.isLink = (text) => {
  const regex = /(https?:\/\/(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/\S*)?)/g;
  return regex.test(text);
};
