const { PREFIX, ASSETS_DIR } = require(`${BASE_DIR}/config`);
const { delay } = require("baileys");
const path = require("node:path");

module.exports = {
  name: "enviar-sticker-de-arquivo",
  description: "Exemplo de como enviar um sticker a partir de um arquivo local",
  commands: ["enviar-sticker-de-arquivo"],
  usage: `${PREFIX}enviar-sticker-de-arquivo`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendStickerFromFile, sendReact }) => {
    await sendReact("🏷️");

    await delay(3000);

    await sendReply("Vou enviar um sticker a partir de um arquivo local");

    await delay(3000);

    await sendStickerFromFile(
      path.join(ASSETS_DIR, "samples", "sample-sticker.webp")
    );

    await delay(3000);

    await sendReply("Você também pode usar outros stickers do projeto:");

    await delay(3000);

    await sendStickerFromFile(
      path.join(ASSETS_DIR, "samples", "sample-sticker.webp")
    );

    await delay(3000);

    await sendReply(
      "Para enviar stickers de arquivo, use a função sendStickerFromFile(filePath, quoted).\n\n" +
        "Isso é útil quando você tem stickers armazenados localmente no servidor."
    );

    await delay(3000);

    await sendReply(
      "💡 *Dica:* O formato ideal para stickers é .webp. Outros formatos podem precisar de conversão."
    );
  },
};
