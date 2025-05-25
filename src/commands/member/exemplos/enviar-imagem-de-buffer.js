const { PREFIX, ASSETS_DIR } = require(`${BASE_DIR}/config`);
const { delay } = require("baileys");
const path = require("node:path");
const fs = require("node:fs");
const { getBuffer } = require(`${BASE_DIR}/utils`);

module.exports = {
  name: "enviar-imagem-de-buffer",
  description: "Exemplo de como enviar uma imagem a partir de um buffer",
  commands: ["enviar-imagem-de-buffer"],
  usage: `${PREFIX}enviar-imagem-de-buffer`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendImageFromBuffer, sendReact, userJid }) => {
    await sendReact("🖼️");

    await delay(3000);

    await sendReply(
      "Vou enviar uma imagem a partir de um buffer de arquivo local"
    );

    await delay(3000);

    const imageBuffer = fs.readFileSync(
      path.join(ASSETS_DIR, "samples", "sample-image.jpg")
    );

    await sendImageFromBuffer(
      imageBuffer,
      "Esta é uma imagem de um buffer de arquivo local"
    );

    await delay(3000);

    await sendReply("Agora vou enviar uma imagem a partir de um buffer de URL");

    await delay(3000);

    const urlBuffer = await getBuffer(
      "https://api.spiderx.com.br/storage/samples/sample-image.jpg"
    );

    await sendImageFromBuffer(
      urlBuffer,
      "Esta é uma imagem de um buffer de URL"
    );

    await delay(3000);

    await sendReply("Você também pode enviar imagens de buffer sem legenda");

    await delay(3000);

    await sendImageFromBuffer(urlBuffer);

    await delay(3000);

    await sendReply("Agora vou enviar uma imagem de buffer mencionando você:");

    await delay(3000);

    await sendImageFromBuffer(
      urlBuffer,
      `Tá ai a imagem @${userJid.split("@")[0]}!`,
      [userJid]
    );

    await delay(3000);

    await sendReply(
      "Para enviar imagens de buffer, use a função sendImageFromBuffer(buffer, caption, [mentions], quoted).\n\n" +
        "Isso é útil quando você tem imagens processadas em memória ou precisa manipular a imagem antes de enviar."
    );
  },
};
