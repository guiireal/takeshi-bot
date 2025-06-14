const { errorLog } = require(`${BASE_DIR}/utils/logger`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { getProfileImageData } = require(`${BASE_DIR}/services/baileys`);
const { getMemberMessageCount } = require(`${BASE_DIR}/utils/database`);
const { PREFIX, BOT_NUMBER, ASSETS_DIR } = require(`${BASE_DIR}/config`);
const { getUserRole, ROLES } = require(`${BASE_DIR}/middlewares/userRoles`);

module.exports = {
    name: "perfil",
    description: "Mostra informações de um usuário",
    commands: ["perfil", "profile"],
    usage: `${PREFIX}perfil ou perfil @usuario`,
    /**
     * @param {CommandHandleProps} props
     * @returns {Promise<void>}
     */
    handle: async ({
        args,
        socket,
        remoteJid,
        isGroup,
        userJid,
        sendErrorReply,
        sendWaitReply,
        sendSuccessReact
    }) => {
        if (!isGroup) {
            throw new InvalidParameterError(
                "Este comando só pode ser usado em grupo."
            );
        }

        const targetJid = args[0]
            ? args[0].replace(/[@ ]/g, "") + "@s.whatsapp.net"
            : userJid;

        const isBotProfile = targetJid.includes(BOT_NUMBER);

        await sendWaitReply("Carregando perfil...");

        try {
            let profilePicUrl;
            let userName;

            try {
                const { profileImage } = await getProfileImageData(
                    socket,
                    targetJid
                );
                profilePicUrl =
                    profileImage || `${ASSETS_DIR}/images/default-user.png`;

                const contactInfo = await socket.onWhatsApp(targetJid);
                userName = contactInfo[0]?.name || "Usuário Desconhecido";
            } catch (error) {
                errorLog(`Erro ao pegar dados do usuário: ${error.message}`);
                profilePicUrl = `${ASSETS_DIR}/images/default-user.png`;
            }

            const userRole = await getUserRole({
                socket,
                userJid: targetJid,
                remoteJid
            });
            const messageCount = isBotProfile
                ? 0
                : getMemberMessageCount(remoteJid, targetJid) || 0;

            const roleDescription = {
                [ROLES.BOT_OWNER]: "Dono do Bot 👑",
                [ROLES.OWNER]: "Dono do Grupo 🔱",
                [ROLES.ADMIN]: "Administrador 🛡️",
                [ROLES.MEMBER]: "Membro 👤"
            };

            const randomPercent = Math.floor(Math.random() * 100);
            const programPrice = (Math.random() * 5000 + 1000).toFixed(2);
            const beautyLevel = Math.floor(Math.random() * 100) + 1;

            let mensagem = `
👤 *Nome:* @${targetJid.split("@")[0]}
🎖️ *Cargo:* ${roleDescription[userRole]}`;

            if (!isBotProfile) {
                mensagem += `\n📊 *Mensagens:* ${messageCount}`;
            }

            mensagem += `\n\n🌚 *Programa:* R$ ${programPrice}
🐮 *Gado:* ${randomPercent + 7 || 5}%
🎱 *Passiva:* ${randomPercent + 5 || 10}%
✨ *Beleza:* ${beautyLevel}%`;

            await sendSuccessReact();

            await socket.sendMessage(remoteJid, {
                image: { url: profilePicUrl },
                caption: mensagem,
                mentions: [targetJid]
            });
        } catch (error) {
            console.error(error);
            sendErrorReply("Ocorreu um erro ao tentar verificar o perfil.");
        }
    }
};
