const fs = require("fs");
const path = require("path");
const { DATABASE_DIR, PREFIX } = require(`${BASE_DIR}/config`);

const DB_PATH = path.join(`${DATABASE_DIR}/group_name.json`);

if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2));
}

module.exports = {
  name: "setname",
  description: "Altera o nome do grupo e salva o nome antigo",
  commands: ["setname", "mudarnome", "nomegrupo"],
  usage: `${PREFIX}setname novo nome do grupo`,
  handle: async ({
    args,
    fullArgs,
    remoteJid,
    socket,
    sendErrorReply,
    sendSuccessReply,
    sendWaitReply,
    isGroup,
    webMessageInfo,
  }) => {

    if (!fullArgs) {
      return sendErrorReply("Você precisa especificar o novo nome do grupo.\nEx: ~setname Novo Nome");
    }

    try {
      sendWaitReply("Alterando o nome do grupo...");

      const groupMetadata = await socket.groupMetadata(remoteJid);
      const oldName = groupMetadata.subject;

      await socket.groupUpdateSubject(remoteJid, fullArgs);

      const db = JSON.parse(fs.readFileSync(DB_PATH));
      db[remoteJid] = {
        antigo: oldName,
        novo: fullArgs,
        data: new Date().toISOString(),
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

      sendSuccessReply(`Nome do grupo alterado com sucesso!\n\nAntigo: *${oldName}*\nNovo: *${fullArgs}*`);
    } catch (err) {
      console.error("Erro ao mudar o nome do grupo:", err);
      sendErrorReply("Falha ao alterar o nome do grupo. Verifique se tenho permissão de administrador.");
    }
  },
};