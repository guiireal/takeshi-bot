const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "abrir/fechar grupo",
  description: "Abre ou fecha o grupo para mensagens dos membros. (Apenas administradores)",
  commands: ["agrupo", "fgrupo", "agp", "fgp"],
  usage: `${PREFIX}agrupo | ${PREFIX}fgrupo`,
  handle: async ({
    socket,
    remoteJid,
    commandName,
    sendReply,
    sendSuccessReact,
    sendErrorReact,
    sendWarningReply,
    userJid
  }) => {
    try {
      // Verifica se o comando está sendo executado em um grupo
      if (!remoteJid.endsWith("@g.us")) {
        await sendWarningReply("Este comando só pode ser usado em grupos.");
        return;
      }

      // Obtém informações do grupo
      const metadata = await socket.groupMetadata(remoteJid);

      // Verifica se o usuário que enviou o comando é administrador
      const sender = metadata.participants.find(
        (participant) => participant.id === userJid
      );
      if (!sender || (sender.admin !== "admin" && sender.admin !== "superadmin")) {
        await sendWarningReply("Você precisa ser um administrador para usar este comando.");
        return;
      }

      // Define a ação e a mensagem de status com base no comando
      const openCommands = ["agrupo", "agp"];
      const closeCommands = ["fgrupo", "fgp"];
      let action, statusText;
      
      if (openCommands.includes(commandName)) {
        action = "not_announcement"; // Permite que todos enviem mensagens
        statusText = "✅ Grupo aberto. Todos os membros podem enviar mensagens.";
      } else if (closeCommands.includes(commandName)) {
        action = "announcement"; // Apenas administradores podem enviar mensagens
        statusText = "✅ Grupo fechado. Apenas administradores podem enviar mensagens.";
      } else {
        await sendWarningReply("Comando inválido.");
        return;
      }

      // Atualiza a configuração do grupo usando o método do Baileys
      await socket.groupSettingUpdate(remoteJid, action);

      await sendSuccessReact();
      await sendReply(statusText);
    } catch (err) {
      console.error("Erro ao alterar as configurações do grupo:", err);
      await sendErrorReact();
      await sendReply("Ocorreu um erro ao tentar alterar as configurações do grupo.");
    }
  },
};