/**
 * Middleware para contar mensagens dos membros dos grupos
 *
 * Desenvolvido por: MRX
 *
 * @author Dev Gui
 */

const { incrementMemberMessageCount } = require("../utils/database");
const { errorLog } = require("../utils/logger");
const { isGroup } = require("../utils");

exports.messageCounter = webMessage => {
    const groupId = webMessage.key.remoteJid;
    const memberId = webMessage.key?.participant;
    const isBotMessage = webMessage.key.fromMe;

    if (!isGroup(groupId) || isBotMessage) {
        return;
    }

    try {
        if (!groupId) {
            return errorLog("messageCounter: groupId não encontrado !");
        } else if (!memberId) {
            return errorLog("messageCounter: memberId não encontrado !");
        }
        
        incrementMemberMessageCount(groupId, memberId);
    } catch (error) {
        errorLog(`Erro no messageCounter: ${error.message}`);
    }
};
