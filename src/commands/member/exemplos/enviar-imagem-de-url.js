const { PREFIX } = require(`${BASE_DIR}/config`);
const { delay } = require("baileys");

module.exports = {
  name: "enviar-imagem-de-url",
  description: "Exemplo de como enviar uma imagem a partir de uma URL",
  commands: ["enviar-imagem-de-url"],
  usage: `${PREFIX}enviar-imagem-de-url`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendImageFromURL, sendReact, userJid }) => {
    await sendReact("🖼️");

    await delay(3000);

    await sendReply("Vou enviar uma imagem a partir de uma URL");

    await delay(3000);

    await sendImageFromURL(
      "https://api.spiderx.com.br/storage/samples/sample-image.jpg",
      "Esta é uma legenda para a imagem da URL"
    );

    await delay(3000);

    await sendReply("Você também pode enviar imagens de URL sem legenda:");

    await delay(3000);

    await sendImageFromURL(
      "https://api.spiderx.com.br/storage/samples/sample-image.jpg"
    );

    await delay(3000);

    await sendReply("Agora vou enviar uma imagem de URL mencionando você:");

    await delay(3000);

    await sendImageFromURL(
      "https://api.spiderx.com.br/storage/samples/sample-image.jpg",
      `Logo do Takeshi Bot para você ${userJid.split("@")[0]}!`,
      [userJid]
    );

    await sendReply(
      "Para enviar imagens de URL, use a função sendImageFromURL(url, caption, [mentions], quoted).\n\n" +
        "Isso é útil quando você tem imagens hospedadas online ou obtidas de APIs."
    );
  },
};
