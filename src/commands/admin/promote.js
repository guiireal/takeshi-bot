const { PREFIX } = require(`${BASE_DIR}/config`);
const { isBotAdmin } = require("../../middlewares");

module.exports = {
    name: "promover",
    description: "Promove um usuário a administrador do grupo",
    commands: ["promover", "promove", "promote", "add-adm"],
    usage: `${PREFIX}promover @usuario`,
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
            return sendWarningReply(
                "Este comando só pode ser usado em grupo !"
            );
        }

        if (!args.length || !args[0]) {
            return sendWarningReply(
                "Por favor, marque um usuário para promover."
            );
        }

        if (!(await isBotAdmin({ remoteJid, socket }))) {
            return sendWarningReply(
                "Eu preciso ser administrador do grupo para promover outros membros !"
            );
        }

        const userId = args[0].replace("@", "") + "@s.whatsapp.net";

        try {
            await socket.groupParticipantsUpdate(
                remoteJid,
                [userId],
                "promote"
            );
            sendSuccessReply("Usuário promovido com sucesso!");
        } catch (error) {
            console.error(error);
            sendErrorReply("Ocorreu um erro ao tentar promover o usuário.");
        }
    }
};
