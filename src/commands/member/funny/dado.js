/**
 * Desenvolvido por: Mkg
 * Refatorado por: Dev Gui
 *
 * @author Dev Gui
 */
const { delay } = require("baileys");

const { getRandomNumber } = require(`${BASE_DIR}/utils`);

const { PREFIX, ASSETS_DIR } = require(`${BASE_DIR}/config`);
const { DangerError } = require(`${BASE_DIR}/errors`);
const path = require("node:path");

module.exports = {
  name: "dado",
  description: "Jogue um dado de 1 a 6 e tente acertar o número para ganhar!",
  commands: ["dado", "dice"],
  usage: `${PREFIX}dado número`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    args,
    sendWaitReply,
    sendReply,
    sendStickerFromURL,
    sendReact,
    webMessage,
  }) => {
    const number = parseInt(args[0]);

    if (!number || number < 1 || number > 6) {
      throw new DangerError(
        `Por favor, escolha um número entre 1 e 6!\nExemplo: ${PREFIX}dado 3`
      );
    }

    await sendWaitReply("🎲 Rolando o dado...");

    const result = getRandomNumber(1, 6);

    const pushName = webMessage?.pushName || "Usuário";

    await sendStickerFromURL(
      path.resolve(ASSETS_DIR, "stickers", "dice", `${result}.webp`)
    );

    await delay(2000);

    if (number === result) {
      await sendReact("🏆");
      await sendReply(
        `🎉 *${pushName} GANHOU!* Você apostou número *${number}* e o dado caiu em *${result}*! 🍀`
      );
    } else {
      await sendReact("😭");
      await sendReply(
        `💥 *${pushName} PERDEU...* Você apostou no *${number}* mas o dado caiu em *${result}*! Tente novamente.`
      );
    }
  },
};
