const fs = require("fs");
const path = require("path");
const { DATABASE_DIR, PREFIX } = require(`${BASE_DIR}/config`);

const DB_PATH = path.join(`${DATABASE_DIR}/group_name.json`);

module.exports = {
  name: "resetname",
  description: "Restaura o nome anterior do grupo salvo no banco",
  commands: ["resetname", "restaurarnome", "nomeantigo"],
  usage: `${PREFIX}resetname`,
  handle: async ({
    remoteJid,
    socket,
    sendErrorReply,
    sendSuccessReply,
    sendWaitReply,
    isGroup,
  }) => {
    if (!remoteJid.endsWith("g.us")) {
      return sendErrorReply("Este comando só pode ser usado em grupos.");
    }

    if (!fs.existsSync(DB_PATH)) {
      return sendErrorReply("Nenhum histórico de nome encontrado.");
    }

    const db = JSON.parse(fs.readFileSync(DB_PATH));

    if (!db[remoteJid] || !db[remoteJid].antigo) {
      return sendErrorReply("Nenhum nome antigo salvo para este grupo.");
    }

    try {
      sendWaitReply("Restaurando o nome do grupo...");

      const oldName = db[remoteJid].antigo;

      await socket.groupUpdateSubject(remoteJid, oldName);

      sendSuccessReply(`Nome do grupo restaurado com sucesso para: *${oldName}*`);
    } catch (err) {
      console.error("Erro ao restaurar o nome do grupo:", err);
      sendErrorReply("Não consegui restaurar o nome do grupo. Verifique se tenho permissão de administrador.");
    }
  },
};