const { PREFIX, ASSETS_DIR } = require(`${BASE_DIR}/config`);
const { delay } = require("baileys");
const path = require("node:path");

module.exports = {
  name: "enviar-imagem-de-arquivo",
  description: "Exemplo de como enviar uma imagem a partir de um arquivo local",
  commands: ["enviar-imagem-de-arquivo"],
  usage: `${PREFIX}enviar-imagem-de-arquivo`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendImageFromFile, sendReact, userJid }) => {
    await sendReact("🖼️");

    await delay(3000);

    await sendReply("Vou enviar uma imagem a partir de um arquivo local");

    await delay(3000);

    await sendImageFromFile(
      path.join(ASSETS_DIR, "samples", "sample-image.jpg"),
      "Esta é uma legenda opcional para a imagem"
    );

    await delay(3000);

    await sendReply("Você também pode enviar imagens sem legenda:");

    await delay(3000);

    await sendImageFromFile(
      path.join(ASSETS_DIR, "samples", "sample-image.jpg")
    );

    await delay(3000);

    await sendReply("Ou usar outras imagens do projeto:");

    await delay(3000);

    await sendImageFromFile(
      path.join(ASSETS_DIR, "images", "takeshi-bot.png"),
      "Logo do Takeshi Bot!"
    );

    await delay(3000);

    await sendReply("Agora vou enviar uma imagem de arquivo mencionando você:");

    await delay(3000);

    await sendImageFromFile(
      path.join(ASSETS_DIR, "images", "takeshi-bot.png"),
      `Logo do Takeshi Bot para você @${userJid.split("@")[0]}!`,
      [userJid]
    );

    await delay(3000);

    await sendReply(
      "Para enviar imagens de arquivo, use a função sendImageFromFile(filePath, caption, [mentions], quoted).\n\n" +
        "Isso é útil quando você tem imagens armazenadas localmente no servidor."
    );
  },
};
