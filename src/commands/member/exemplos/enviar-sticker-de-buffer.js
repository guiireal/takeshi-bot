const { PREFIX, ASSETS_DIR } = require(`${BASE_DIR}/config`);
const { delay } = require("baileys");
const path = require("node:path");
const fs = require("node:fs");
const { getBuffer } = require(`${BASE_DIR}/utils`);

module.exports = {
  name: "enviar-sticker-de-buffer",
  description: "Exemplo de como enviar um sticker a partir de um buffer",
  commands: ["enviar-sticker-de-buffer"],
  usage: `${PREFIX}enviar-sticker-de-buffer`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendReact, sendStickerFromBuffer }) => {
    await sendReact("🏷️");

    await delay(3000);

    await sendReply(
      "Vou enviar um sticker a partir de um buffer de arquivo local"
    );

    await delay(3000);

    const stickerBuffer = fs.readFileSync(
      path.join(ASSETS_DIR, "samples", "sample-sticker.webp")
    );

    await sendStickerFromBuffer(stickerBuffer);

    await delay(3000);

    await sendReply(
      "Agora vou enviar um sticker a partir de um buffer de URL e sem mencionar a mensagem"
    );

    await delay(3000);

    const urlBuffer = await getBuffer(
      "https://api.spiderx.com.br/storage/samples/sample-sticker.webp"
    );

    await sendStickerFromBuffer(urlBuffer, false);

    await delay(3000);

    await sendReply(
      "Para enviar stickers de buffer, use a função sendStickerFromBuffer(buffer, quoted)."
    );

    await delay(3000);

    await sendReply(
      "💡 *Dica:* Buffers são úteis para stickers gerados dinamicamente ou convertidos de outros formatos."
    );
  },
};
