const fs = require("fs");
const path = require("path");
const { PREFIX, DATABASE_DIR } = require(`${BASE_DIR}/config`);

module.exports = {
    name: "bot-config",
    description: "Mostra todas as configurações ativas no grupo",
    commands: ["bot-config", "grupo-config", "group-settings", "configs", "configuracoes"],
    usage: `${PREFIX}bot-config`,
    handle: async ({
        remoteJid,
        sendReply,
        sendSuccessReact,
        sendErrorReply,
        isGroup
    }) => {
        try {
            if (!isGroup) {
                return sendErrorReply("Este comando só funciona em grupos!");
            }

            const configPath = path.join(
                DATABASE_DIR,
                "group-restrictions.json"
            );
            if (!fs.existsSync(configPath)) {
                return sendErrorReply("Configurações não encontradas!");
            }

            const allConfigs = JSON.parse(fs.readFileSync(configPath, "utf-8"));
            const groupConfig = allConfigs[remoteJid] || {};

            const allRestrictions = {
                "anti-sticker": "Anti Figurinhas",
                "anti-video": "Anti Vídeos",
                "anti-image": "Anti Imagens",
                "anti-audio": "Anti Áudios",
                "anti-event": "Anti Eventos",
                "anti-product": "Anti Produtos",
                "anti-document": "Anti Documentos"
            };

            let statusMessage = `⚙️ *Configurações Ativas* ⚙️\n\n`;

            for (const [key, label] of Object.entries(allRestrictions)) {
                const status = groupConfig[key] ? "✅" : "❌";
                statusMessage += `${status} *${label}:* ${
                    groupConfig[key] ? "Ativado" : "Desativado"
                }\n`;
            }

            statusMessage += `\nPara modificar, use: ${PREFIX}anti-tipo (1/0)\n\n- *Ex:* ${PREFIX}anti-sticker 1`;

            await sendReply(statusMessage);
            await sendSuccessReact();
        } catch (error) {
            console.error("Erro no comando group-settings:", error);
            return sendErrorReply(
                "Ocorreu um erro ao verificar as configurações."
            );
        }
    }
};
