const { PREFIX } = require(`${BASE_DIR}/config`);
const { delay } = require("baileys");

module.exports = {
  name: "enviar-video-de-url",
  description: "Exemplo de como enviar um vídeo a partir de uma URL",
  commands: ["enviar-video-de-url"],
  usage: `${PREFIX}enviar-video-de-url`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendVideoFromURL, sendReact, userJid }) => {
    await sendReact("🎥");

    await delay(3000);

    await sendReply("Vou enviar um vídeo a partir de uma URL");

    await delay(3000);

    await sendVideoFromURL(
      "https://api.spiderx.com.br/storage/samples/sample-video.mp4"
    );

    await delay(3000);

    await sendReply("Enviar também sem mencionar a mensagem do usuário:");

    await delay(3000);

    await sendVideoFromURL(
      "https://api.spiderx.com.br/storage/samples/sample-video.mp4",
      null,
      false
    );

    await delay(3000);

    await sendReply("Você também pode enviar vídeos com legenda:");

    await delay(3000);

    await sendVideoFromURL(
      "https://api.spiderx.com.br/storage/samples/sample-video.mp4",
      "Aqui está o vídeo que você pediu!"
    );

    await delay(3000);

    await sendReply("Também vídeos com legenda, mencionando o usuário:");

    await delay(3000);

    await sendVideoFromURL(
      "https://api.spiderx.com.br/storage/samples/sample-video.mp4",
      `Aqui está o vídeo que você pediu @${userJid.split("@")[0]}!`,
      [userJid]
    );

    await delay(3000);

    await sendReply(
      "Para enviar vídeos de URL, use a função sendVideoFromURL(url, caption, [mentions], quoted).\n\n" +
        "Isso é útil quando você tem vídeos hospedados online ou obtidos de APIs."
    );

    await delay(3000);

    await sendReply(
      "💡 *Dica:* Certifique-se de que a URL aponta para um arquivo de vídeo válido e acessível."
    );
  },
};
