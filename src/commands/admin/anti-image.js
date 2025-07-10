const fs = require("fs");
const path = require("path");
const { PREFIX, DATABASE_DIR } = require(`${BASE_DIR}/config`);
const GROUP_RESTRICTIONS_FILE = `${DATABASE_DIR}/group-restrictions.json`;

module.exports = {
    name: "anti-image",
    description: "Ativa/Desativa o recurso de anti-imagem no grupo.",
    commands: ["anti-imagem", "anti-image", "anti-img"],
    usage: `${PREFIX}anti-imagem (1 / 0)`,
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
                    "Apenas administradores podem configurar o anti-imagem!"
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

            restrictions[remoteJid]["anti-image"] = enable;

            fs.writeFileSync(
                GROUP_RESTRICTIONS_FILE,
                JSON.stringify(restrictions, null, 2)
            );

            const status = enable ? "ativado" : "desativado";
            return await sendSuccessReply(
                `Anti-imagem ${status} com sucesso!`
            );
        } catch (error) {
            console.error("Erro no comando anti-image:", error);
            return await sendErrorReply(
                "Ocorreu um erro ao configurar o anti-image. Por favor, tente novamente."
            );
        }
    }
};
