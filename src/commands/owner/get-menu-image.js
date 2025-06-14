const fs = require("node:fs");
const path = require("node:path");
const { errorLog } = require(`${BASE_DIR}/utils/logger`);
const { PREFIX, ASSETS_DIR } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
    name: "get-menu-image",
    description: "Altera a imagem do menu do bot",
    commands: [
        "get-menu-image",
        "get-image-menu",
        "get-img-menu",
        "get-menu-img",
        "set-menu-image",
        "set-menu-img"
    ],
    usage: `${PREFIX}get-menu-image (responda a uma imagem)`,
    /**
     * @param {CommandHandleProps} props
     * @returns {Promise<void>}
     */
    handle: async ({
        isImage,
        isReply,
        downloadImage,
        sendSuccessReply,
        sendErrorReply,
        webMessage
    }) => {
        if (!isReply || !isImage) {
            throw new InvalidParameterError(
                "Você precisa responder a uma mensagem que contenha uma imagem!"
            );
        }

        try {
            const menuImagePath = path.join(
                ASSETS_DIR,
                "images",
                "takeshi-bot.png"
            );

            let backupPath = "";
            if (fs.existsSync(menuImagePath)) {
                backupPath = path.join(
                    ASSETS_DIR,
                    "images",
                    "takeshi-bot-backup.png"
                );
                fs.copyFileSync(menuImagePath, backupPath);
            }

            const tempPath = await downloadImage(
                webMessage,
                "new-menu-image-temp"
            );

            if (fs.existsSync(menuImagePath)) {
                fs.unlinkSync(menuImagePath);
            }

            fs.renameSync(tempPath, menuImagePath);

            await sendSuccessReply("Imagem do menu atulizada com sucesso !");
        } catch (error) {
            errorLog(`Erro ao alterar imagem do menu:  ${error}`);
            await sendErrorReply(
                "Ocorreu um erro ao tentar alterar a imagem do menu. Por favor, tente novamente."
            );
        }
    }
};
