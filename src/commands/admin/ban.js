const { PREFIX, OWNER_NUMBER, BOT_NUMBER } = require(`${BASE_DIR}/config`);
const { DangerError, InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);
const { isBotAdmin } = require(`${BASE_DIR}/middlewares`);

module.exports = {
    name: "banir",
    description: "Removo um membro do grupo",
    commands: ["ban", "kick"],
    usage: `${PREFIX}ban @marcar_membro 
  
ou 

${PREFIX}ban (mencionando uma mensagem)`,
    /**
     * @param {CommandHandleProps} props
     * @returns {Promise<void>}
     */
    handle: async ({
        args,
        isReply,
        socket,
        remoteJid,
        replyJid,
        sendReply,
        userJid,
        isGroup,
        sendWarningReply,
        sendSuccessReact
    }) => {
        if (!isGroup) {
            return sendWarningReply(
                "Este comando só pode ser usado em grupo !"
            );
        }
        
        if (!args.length && !isReply) {
            throw new InvalidParameterError(
                "Você precisa mencionar ou marcar um membro!"
            );
        }

        if (!(await isBotAdmin({ remoteJid, socket }))) {
            return sendWarningReply(
                "Eu preciso ser administrador do grupo para remover outros membros !"
            );
        }
        
        const memberToRemoveJid = isReply ? replyJid : toUserJid(args[0]);
        const memberToRemoveNumber = onlyNumbers(memberToRemoveJid);

        if (
            memberToRemoveNumber.length < 7 ||
            memberToRemoveNumber.length > 15
        ) {
            throw new InvalidParameterError("Número inválido!");
        }

        if (memberToRemoveJid === userJid) {
            throw new DangerError("Você não pode remover você mesmo!");
        }

        if (memberToRemoveNumber === OWNER_NUMBER) {
            throw new DangerError("Você não pode remover o dono do bot!");
        }

        const botJid = toUserJid(BOT_NUMBER);

        if (memberToRemoveJid === botJid) {
            throw new DangerError("Você não pode me remover!");
        }

        await socket.groupParticipantsUpdate(
            remoteJid,
            [memberToRemoveJid],
            "remove"
        );

        await sendSuccessReact();

        await sendReply("Membro removido com sucesso!");
    }
};
