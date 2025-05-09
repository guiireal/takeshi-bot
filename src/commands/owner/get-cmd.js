const fs = require("fs");
const path = require("path");
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "get-cmd",
  description: "Busca e retorna um arquivo de comando por nome",
  commands: ["get-cmd"],
  usage: `${PREFIX}get-cmd <nome do comando>`,
  handle: async ({ args, sendErrorReply, sendReply, sendSuccessReact, sendErrorReact, socket, remoteJid }) => {
    if (!args[0]) {
      return sendErrorReply(`Use:\n${PREFIX}get-cmd <nome do comando>`);
    }

    const commandToFind = args[0].toLowerCase();
    const commandDirs = ["commands/owner", "commands/admin", "commands/member", "commands/member/brincadeiras", "commands/member/downloads", "commands/member/canvas", "commands/member/ia", "commands/member/search"];
    let foundFilePath = null;

    for (const dir of commandDirs) {
      const dirPath = path.join(BASE_DIR, dir);
      if (!fs.existsSync(dirPath)) continue;

      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        if (file.toLowerCase() === `${commandToFind}.js`) {
          foundFilePath = filePath;
          break;
        }
      }

      if (foundFilePath) break;
    }

    if (!foundFilePath) {
      await sendErrorReact();
      return sendErrorReply(`Comando "${commandToFind}" não encontrado nas pastas.`);
    }

    await sendSuccessReact();

    await socket.sendMessage(remoteJid, {
      document: fs.readFileSync(foundFilePath),
      mimetype: "application/javascript",
      fileName: path.basename(foundFilePath),
    });
  },
};