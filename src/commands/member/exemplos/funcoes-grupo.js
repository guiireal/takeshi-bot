import { delay } from "zapo-js";
import { PREFIX } from "../../../config.js";

export default {
  name: "funcoes-grupo",
  description: "Exemplo de como usar as funções utilitárias de grupo",
  commands: ["funcoes-grupo"],
  usage: `${PREFIX}funcoes-grupo`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    sendReply,
    sendReact,
    sendErrorReply,
    isGroup,
    getGroupMetadata,
    getGroupName,
    getGroupOwner,
    getGroupParticipants,
    getGroupAdmins,
    socket,
    remoteJid,
  }) => {
    await sendReact("👥");

    await delay(3000);

    if (!isGroup) {
      return await sendErrorReply("Este comando só funciona em grupos!");
    }

    await sendReply("Vou demonstrar as funções utilitárias de grupo:");

    await delay(3000);

    const groupName = await getGroupName();
    await sendReply(`📝 *Nome do grupo:* ${groupName}`);

    await delay(3000);

    const groupOwner = await getGroupOwner();
    if (groupOwner) {
      await socket.sendMessage(remoteJid, {
        text: `👑 *Dono do grupo:* @${groupOwner.split("@")[0]}`,
        mentions: [groupOwner],
      });
    }

    await delay(3000);

    const participants = await getGroupParticipants();
    await sendReply(`👤 *Total de participantes:* ${participants.length}`);

    await delay(3000);

    const admins = await getGroupAdmins();
    if (admins.length > 0) {
      const adminList = admins
        .map((admin) => `@${admin.split("@")[0]}`)
        .join(", ");
      await socket.sendMessage(remoteJid, {
        text: `👮 *Administradores (${admins.length}):*\n${adminList}`,
        mentions: admins,
      });
    } else {
      await sendReply("👮 *Nenhum administrador encontrado.*");
    }

    await delay(3000);

    const metadata = await getGroupMetadata();
    if (metadata) {
      const creationDate = metadata.creation
        ? new Date(metadata.creation * 1000).toLocaleDateString("pt-BR")
        : "N/A";
      const announce = metadata.announce ? "Sim" : "Não";
      const restrict = metadata.restrict ? "Sim" : "Não";

      await sendReply(
        `📊 *Metadados do grupo:*\n\n` +
          `• ID: ${metadata.id}\n` +
          `• Criado em: ${creationDate}\n` +
          `• Apenas admins enviam: ${announce}\n` +
          `• Aprovação para entrar: ${restrict}\n` +
          `• Descrição: ${metadata.desc || "Sem descrição"}`
      );
    }

    await delay(3000);

    await sendReply(
      "💡 *Funções disponíveis:*\n\n" +
        "• `getGroupMetadata(remoteJid?)` - Metadados completos\n" +
        "• `getGroupName(remoteJid?)` - Nome do grupo\n" +
        "• `getGroupOwner(remoteJid?)` - Dono do grupo\n" +
        "• `getGroupParticipants(remoteJid?)` - Lista de participantes\n" +
        "• `getGroupAdmins(remoteJid?)` - Lista de administradores\n\n" +
        "🔧 *Parâmetro opcional:*\n" +
        "• `remoteJid` - ID do grupo/conversa (se não fornecido, usa o grupo atual)"
    );
  },
};
