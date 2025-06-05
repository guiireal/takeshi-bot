/**
 * Desenvolvido por: Mkg
 * Refatorado por: Dev Gui
 *
 * @author Dev Gui
 */
const { delay } = require("baileys");

const { getRandomNumber } = require(`${BASE_DIR}/utils`);

const { PREFIX } = require(`${BASE_DIR}/config`);
const { DangerError } = require(`${BASE_DIR}/errors`);

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

    await sendReply("🎲 Rolando o dado...");

    const dices = [
      { url: "https://i.ibb.co/zmVD85Z/53025f3f00f8.webp", number: 6 },
      { url: "https://i.ibb.co/BchBsJ1/0b7b4a9b811d.webp", number: 5 },
      { url: "https://i.ibb.co/25Pf1sY/a66d2b63f357.webp", number: 4 },
      { url: "https://i.ibb.co/hccTrhd/5b36dd6442b8.webp", number: 3 },
      { url: "https://i.ibb.co/9tPHPDt/544dbba5bb75.webp", number: 2 },
      { url: "https://i.ibb.co/y040HHw/3e583d6459e6.webp", number: 1 },
    ];

    const result = getRandomNumber(0, dices.length - 1);

    const pushName = webMessage?.pushName || "Usuário";

    await sendStickerFromURL(result.url);

    await delay(2000);

    if (number === result.number) {
      await sendReact("🏆");
      await sendReply(
        `🎉 *${pushName} GANHOU!* Você apostou número *${number}* e o dado caiu em *${result.number}*! 🍀`
      );
    } else {
      await sendReact("😭");
      await sendReply(
        `💥 *${pushName} PERDEU...* Você apostou no *${number}* mas o dado caiu em *${result.number}*! Tente novamente.`
      );
    }
  },
};
