const { PREFIX, ASSETS_DIR } = require(`${BASE_DIR}/config`);
const { delay } = require("baileys");
const path = require("node:path");
const fs = require("node:fs");
const { getBuffer } = require(`${BASE_DIR}/utils`);

module.exports = {
  name: "enviar-gif-de-buffer",
  description: "Exemplo de como enviar gifs a partir de buffers",
  commands: ["enviar-gif-de-buffer"],
  usage: `${PREFIX}enviar-gif-de-buffer`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendGifFromBuffer, sendReact, userJid }) => {
    await sendReact("💾");

    await delay(3000);

    await sendReply(
      "Vou enviar gifs a partir de buffers (arquivo local e URL)"
    );

    await delay(3000);

    const fileBuffer = fs.readFileSync(
      path.join(ASSETS_DIR, "samples", "sample-video.mp4")
    );

    await sendGifFromBuffer(fileBuffer);

    await delay(3000);

    await sendReply("Agora de um buffer obtido de uma URL:");

    await delay(3000);

    const urlBuffer = await getBuffer(
      "https://api.spiderx.com.br/storage/samples/sample-video.mp4"
    );

    await sendGifFromBuffer(urlBuffer, "GIF carregado de URL para buffer!");

    await delay(3000);

    await sendReply("Com menção:");

    await delay(3000);

    await sendGifFromBuffer(
      fileBuffer,
      `@${userJid.split("@")[0]} este gif veio de um buffer!`,
      [userJid]
    );

    await delay(3000);

    await sendReply("E sem responder em cima da sua mensagem:");

    await delay(3000);

    await sendGifFromBuffer(fileBuffer, "GIF de buffer sem reply", null, false);

    await delay(3000);

    await sendReply(
      "Para enviar imagens de arquivo, use a função sendGifFromBuffer(buffer, caption, [mentions], quoted).\n\n" +
        "Isso é útil para gifs gerados dinamicamente ou convertidos de outros formatos!"
    );

    await delay(3000);

    await sendReply(
      "💾 *Vantagens dos buffers:*\n\n" +
        "• Processamento na memória\n" +
        "• Conversão de formatos\n" +
        "• Manipulação de dados\n" +
        "• Cache temporário\n\n" +
        "💡 *Dica:* Buffers são úteis para GIFs gerados dinamicamente ou convertidos!"
    );
  },
};
