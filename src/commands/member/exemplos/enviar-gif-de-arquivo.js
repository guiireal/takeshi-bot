const { PREFIX, ASSETS_DIR } = require(`${BASE_DIR}/config`);
const { delay } = require("baileys");
const path = require("node:path");

module.exports = {
  name: "enviar-gif-de-arquivo",
  description: "Exemplo de como enviar gifs a partir de arquivos locais",
  commands: ["enviar-gif-de-arquivo"],
  usage: `${PREFIX}enviar-gif-de-arquivo`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendGifFromFile, sendReact, userJid }) => {
    await sendReact("🎬");

    await delay(3000);

    await sendReply("Vou enviar gifs a partir de arquivos locais");

    await delay(3000);

    await sendGifFromFile(path.join(ASSETS_DIR, "samples", "sample-video.mp4"));

    await delay(3000);

    await sendReply("Agora com legenda:");

    await delay(3000);

    await sendGifFromFile(
      path.join(ASSETS_DIR, "samples", "sample-video.mp4"),
      "Este é um gif com legenda!"
    );

    await delay(3000);

    await sendReply("Agora mencionando você:");

    await delay(3000);

    await sendGifFromFile(
      path.join(ASSETS_DIR, "samples", "sample-video.mp4"),
      `Olá @${userJid.split("@")[0]}! Este gif é para você!`,
      [userJid]
    );

    await delay(3000);

    await sendReply("E agora sem responder em cima da sua mensagem:");

    await delay(3000);

    await sendGifFromFile(
      path.join(ASSETS_DIR, "samples", "sample-video.mp4"),
      "Gif sem reply/menção na mensagem",
      null,
      false
    );

    await delay(3000);

    await sendReply(
      "Para enviar imagens de arquivo, use a função sendGifFromFile(url, caption, [mentions], quoted).\n\n" +
        "Isso é útil quando você tem gifs armazenados localmente no servidor."
    );
  },
};
