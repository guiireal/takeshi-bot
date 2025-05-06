const { DEFAULT_PREFIX } = require(`${BASE_DIR}/config`);
const { isBotAdmin } = require("../../middlewares");

module.exports = {
    name: "rebaixar",
    description: "Rebaixa um administrador para membro comum",
    commands: ["rebaixar", "rebaixa", "demote"],
    usage: `${DEFAULT_PREFIX}rebaixar @usuario`,
    handle: async ({
        args,
        remoteJid,
        socket,
        isGroup,
        sendWarningReply,
        sendSuccessReply,
        sendErrorReply
    }) => {
        if (!isGroup(remoteJid)) {
            return sendWarningReply("Este comando só pode ser usado em grupo !");
        }

        if (!args.length || !args[0]) {
            return sendWarningReply(
                "Por favor, marque um administrador para rebaixar."
            );
        }

        if (!(await isBotAdmin({ remoteJid, socket }))) {
            return sendWarningReply(
                "Eu preciso ser administrador do grupo para rebaixar outros administradores !"
            );
        }

        const userId = args[0].replace("@", "") + "@s.whatsapp.net";

        try {
            await socket.groupParticipantsUpdate(remoteJid, [userId], "demote");
            sendSuccessReply("Usuário rebaixado com sucesso!");
        } catch (error) {
            console.error(error);
            sendErrorReply("Ocorreu um erro ao tentar rebaixar o usuário.");
        }
    }
};
