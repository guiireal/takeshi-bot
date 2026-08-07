import { delay } from "zapo-js";
import { PREFIX } from "../../../config.js";

export default {
  name: "obter-dados-grupo",
  description: "Exemplo de como obter informações detalhadas do grupo",
  commands: ["obter-dados-grupo"],
  usage: `${PREFIX}obter-dados-grupo`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    sendReply,
    sendReact,
    sendErrorReply,
    getGroupMetadata,
    isGroup,
    socket,
    remoteJid,
  }) => {
    await sendReact("👥");

    await delay(3000);

    if (!isGroup) {
      return await sendErrorReply("Este comando só funciona em grupos!");
    }

    await sendReply("Vou obter as informações do grupo atual:");

    await delay(3000);

    try {
      const groupMetadata = await getGroupMetadata();

      const groupInfo = `👥 *Informações do Grupo:*

📝 *Básico:*
• Nome: ${groupMetadata.subject}
• Descrição: ${groupMetadata.desc || "Sem descrição"}
• ID: ${groupMetadata.id}

👤 *Participantes:*
• Total: ${groupMetadata.participants.length} membros
• Admins: ${groupMetadata.participants.filter((p) => p.admin).length}
• Membros: ${groupMetadata.participants.filter((p) => !p.admin).length}

⚙️ *Configurações:*
• Criado em: ${
        groupMetadata.creation
          ? new Date(groupMetadata.creation * 1000).toLocaleDateString(
              "pt-BR",
            )
          : "N/A"
      }
• Dono: ${groupMetadata.owner || "N/A"}
• Apenas admins podem enviar: ${groupMetadata.announce ? "Sim" : "Não"}
• Aprovação para entrar: ${groupMetadata.restrict ? "Sim" : "Não"}`;

      await sendReply(groupInfo);

      await delay(3000);

      const admins = groupMetadata.participants.filter((p) => p.admin);

      if (admins.length > 0) {
        const adminList =
          `👑 *Administradores (${admins.length}):*\n\n` +
          admins
            .map(
              (admin, index) =>
                `${index + 1}. @${admin.id.split("@")[0]} ${
                  admin.admin === "superadmin" ? "(Criador)" : "(Admin)"
                }`
            )
            .join("\n");

        await socket.sendMessage(remoteJid, {
          text: adminList,
          mentions: admins.map((admin) => admin.id),
        });
      }

      await delay(3000);

      await sendReply(
        "💡 *Funções úteis:*\n\n" +
          "• `socket.groupMetadata(jid) ou getGroupMetadata()` - Obtém metadados do grupo\n" +
          "• `groupMetadata.participants` - Lista participantes\n" +
          "• `groupMetadata.subject` - Nome do grupo\n" +
          "• `groupMetadata.desc` - Descrição do grupo"
      );
    } catch (error) {
      await sendErrorReply(`Erro ao obter dados do grupo: ${error.message}`);
    }
  },
};
