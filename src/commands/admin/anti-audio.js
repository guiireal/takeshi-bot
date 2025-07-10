const fs = require("fs");
const { PREFIX, DATABASE_DIR } = require(`${BASE_DIR}/config`);
const GROUP_RESTRICTIONS_FILE = `${DATABASE_DIR}/group-restrictions.json`;

module.exports = {
    name: "anti-audio",
    description: "Ativa/Desativa o recurso de anti-audio no grupo.",
    commands: ["anti-audio"],
    usage: `${PREFIX}anti-audio (1 / 0)`,
    handle: async ({
        remoteJid,
        isGroup,
        args,
        sendSuccessReply,
        sendWarningReply,
        sendErrorReply,
        userJid,
        getGroupAdmins
    }) => {
        try {
            if (!isGroup) {
                return await sendWarningReply(
                    "Este comando só deve ser usado em grupos!"
                );
            }

            const admins = await getGroupAdmins();
            if (!admins.includes(userJid)) {
                return await sendWarningReply(
                    "Apenas administradores podem configurar o anti-audio!"
                );
            }

            if (args.length === 0 || !["0", "1"].includes(args[0])) {
                return await sendWarningReply(
                    "Use (1 ou 0) para ativar ou desativar o recurso!"
                );
            }

            const enable = args[0] === "1";

            let restrictions = {};
            if (fs.existsSync(GROUP_RESTRICTIONS_FILE)) {
                restrictions = JSON.parse(
                    fs.readFileSync(GROUP_RESTRICTIONS_FILE, "utf-8")
                );
            }

            if (!restrictions[remoteJid]) {
                restrictions[remoteJid] = {};
            }

            restrictions[remoteJid]["anti-audio"] = enable;

            fs.writeFileSync(
                GROUP_RESTRICTIONS_FILE,
                JSON.stringify(restrictions, null, 2)
            );

            const status = enable ? "ativado" : "desativado";
            return await sendSuccessReply(`Anti-audio ${status} com sucesso!`);
        } catch (error) {
            console.error("Erro no comando anti-audio:", error);
            return await sendErrorReply(
                "Ocorreu um erro ao configurar o anti-audio. Por favor, tente novamente."
            );
        }
    }
};
