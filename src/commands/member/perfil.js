import { ASSETS_DIR, PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { getProfileImageData } from "../../services/baileys.js";
import { isGroup, onlyNumbers } from "../../utils/index.js";
import { errorLog } from "../../utils/logger.js";

export default {
  name: "perfil",
  description: "Mostra informações de um usuário",
  commands: ["perfil", "profile"],
  usage: `${PREFIX}perfil ou perfil @usuario`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    args,
    socket,
    remoteJid,
    userLid,
    sendErrorReply,
    sendWaitReply,
    sendSuccessReact,
  }) => {
    if (!isGroup(remoteJid)) {
      throw new InvalidParameterError(
        "Este comando só pode ser usado em grupo."
      );
    }

    const targetLid = args[0] ? `${onlyNumbers(args[0])}@lid` : userLid;

    await sendWaitReply("Carregando perfil...");

    try {
      let profilePicUrl;
      let userRole = "Membro";

      try {
        const { profileImage } = await getProfileImageData(socket, targetLid);
        profilePicUrl = profileImage || `${ASSETS_DIR}/images/default-user.png`;
      } catch (error) {
        errorLog(
          `Erro ao tentar pegar dados do usuário ${targetLid}: ${JSON.stringify(
            error,
            null,
            2
          )}`
        );
        profilePicUrl = `${ASSETS_DIR}/images/default-user.png`;
      }

      const groupMetadata = await socket.groupMetadata(remoteJid);

      const participant = groupMetadata.participants.find(
        (participant) => participant.id === targetLid
      );

      if (participant?.admin) {
        userRole = "Administrador";
      }

      const randomPercent = Math.floor(Math.random() * 100);
      const programPrice = (Math.random() * 5000 + 1000).toFixed(2);
      const beautyLevel = Math.floor(Math.random() * 100) + 1;

      const mensagem = `
👤 *Nome:* @${targetLid.split("@")[0]}
🎖️ *Cargo:* ${userRole}

🌚 *Programa:* R$ ${programPrice}
🐮 *Gado:* ${randomPercent + 7 || 5}%
🎱 *Passiva:* ${randomPercent + 5 || 10}%
✨ *Beleza:* ${beautyLevel}%`;

      const mentions = [targetLid];

      await sendSuccessReact();

      await socket.sendMessage(remoteJid, {
        image: { url: profilePicUrl },
        caption: mensagem,
        mentions: mentions,
      });
    } catch (error) {
      console.error(error);
      sendErrorReply("Ocorreu um erro ao tentar verificar o perfil.");
    }
  },
};
