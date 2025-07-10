const fs = require("fs");
const path = require("path");
const { isAdmin } = require(".");
const { getContent } = require("../utils");
const { DATABASE_DIR } = require("../config");

const restrictedMessageTypes = require(
    `${DATABASE_DIR}/restricted-message.json`
);

const readAntiGroups = () => {
    const filePath = path.join(`${DATABASE_DIR}/group-restrictions.json`);
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
};

module.exports = async (socket, webMessage) => {
    try {
        const {
            remoteJid,
            fromMe,
            id: messageId,
            participant: userJid
        } = webMessage.key;

        const antiGroups = readAntiGroups();

        const messageType = Object.keys(restrictedMessageTypes).find(type =>
            getContent(webMessage, type)
        );

        if (!messageType) return;

        const isAntiActive = antiGroups[remoteJid]?.[`anti-${messageType}`];
        if (!isAntiActive) return;

        // if (isAdmin({ remoteJid, userJid, socket })) return;

        await socket.sendMessage(remoteJid, {
            delete: {
                remoteJid,
                fromMe,
                id: messageId,
                participant: userJid
            }
        });
    } catch (error) {
        console.error(`Erro ao processar mensagem restrita:`, error);
    }
};
