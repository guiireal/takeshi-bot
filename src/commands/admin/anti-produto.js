const fs = require("fs");
const path = require("path");
const { PREFIX, DATABASE_DIR } = require(`${BASE_DIR}/config`);
const GROUP_RESTRICTIONS_FILE = `${DATABASE_DIR}/group-restrictions.json`;

module.exports = {
    name: "anti-produto",
    description: "Ativa/Desativa o recurso de anti-produto no grupo.",
    commands: ["anti-produto", "anti-product"],
    usage: `${PREFIX}anti-produto (1 / 0)`,
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
                    "Apenas administradores podem configurar o anti-produto!"
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

            restrictions[remoteJid]["anti-product"] = enable;

            fs.writeFileSync(
                GROUP_RESTRICTIONS_FILE,
                JSON.stringify(restrictions, null, 2)
            );

            const status = enable ? "ativado" : "desativado";
            return await sendSuccessReply(
                `Anti-produto ${status} com sucesso!`
            );
        } catch (error) {
            console.error("Erro no comando anti-produto:", error);
            return await sendErrorReply(
                "Ocorreu um erro ao configurar o anti-produto. Por favor, tente novamente."
            );
        }
    }
};
