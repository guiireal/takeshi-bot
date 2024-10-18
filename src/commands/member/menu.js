const { PREFIX, ASSETS_DIR } = require("../../config");
const { menuMessage } = require("../../utils/messages");
const path = require("path");

module.exports = {
  name: "menu",
  description: "Menu de comandos",
  commands: ["menu", "help"],
  usage: `${PREFIX}menu`,
  handle: async ({ sendImageFromFile }) => {
    await sendImageFromFile(
      path.join(ASSETS_DIR, "images", "takeshi-bot.png"),
      `\n\n${menuMessage()}`
    );
  },
};
