/**
 * Logs
 *
 * @author Dev Gui
 */
const { version } = require("../../package.json");

exports.sayLog = (message) => {
  console.log("\x1b[36m[TAKESHI BOT | TALK]\x1b[0m", message);
};

exports.inputLog = (message) => {
  console.log("\x1b[30m[TAKESHI BOT | INPUT]\x1b[0m", message);
};

exports.infoLog = (message) => {
  console.log("\x1b[34m[TAKESHI BOT | INFO]\x1b[0m", message);
};

exports.successLog = (message) => {
  console.log("\x1b[32m[TAKESHI BOT | SUCCESS]\x1b[0m", message);
};

exports.errorLog = (message) => {
  console.log("\x1b[31m[TAKESHI BOT | ERROR]\x1b[0m", message);
};

exports.warningLog = (message) => {
  console.log("\x1b[33m[TAKESHI BOT | WARNING]\x1b[0m", message);
};

exports.bannerLog = () => {
  console.log(`\x1b[36m░▀█▀░█▀█░█░█░█▀▀░█▀▀░█░█░▀█▀░░█▀▄░█▀█░▀█▀\x1b[0m`);
  console.log(`░░█░░█▀█░█▀▄░█▀▀░▀▀█░█▀█░░█░░░█▀▄░█░█░░█░`);
  console.log(`\x1b[36m░░▀░░▀░▀░▀░▀░▀▀▀░▀▀▀░▀░▀░▀▀▀░░▀▀░░▀▀▀░░▀░\x1b[0m`);
  console.log(`\x1b[36m🤖 Versão: \x1b[0m${version}\n`);
};
