import { delay } from "zapo-js";
import { PREFIX } from "../../../config.js";

export default {
  name: "enviar-gif-de-url",
  description: "Exemplo de como enviar gifs a partir de URLs externas",
  commands: ["enviar-gif-de-url"],
  usage: `${PREFIX}enviar-gif-de-url`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendGifFromURL, sendReact, userLid }) => {
    await sendReact("🌐");

    await delay(3000);

    await sendReply("Vou enviar gifs a partir de URLs externas");

    await delay(3000);

    await sendGifFromURL(
      "https://api.spiderx.com.br/storage/samples/sample-video.mp4"
    );

    await delay(3000);

    await sendReply("Agora com legenda:");

    await delay(3000);

    await sendGifFromURL(
      "https://api.spiderx.com.br/storage/samples/sample-video.mp4",
      "GIF carregado de uma URL externa!"
    );

    await delay(3000);

    await sendReply("Com menção:");

    await delay(3000);

    await sendGifFromURL(
      "https://api.spiderx.com.br/storage/samples/sample-video.mp4",
      `@${userLid.split("@")[0]} olha que legal este gif!`,
      [userLid]
    );

    await delay(3000);

    await sendReply("E sem responder em cima da sua mensagem:");

    await delay(3000);

    await sendGifFromURL(
      "https://api.spiderx.com.br/storage/samples/sample-video.mp4",
      "GIF sem reply",
      undefined,
      false
    );

    await delay(3000);

    await sendReply(
      "Para enviar imagens de arquivo, use a função sendGifFromURL(url, caption, [mentions], quoted).\n\n" +
        "Isso é útil quando você tem imagens hospedadas online ou obtidas de APIs."
    );

    await delay(3000);

    await sendReply(
      "🌐 *URLs úteis para GIFs:*\n\n" +
        "• Giphy: giphy.com\n" +
        "• Tenor: tenor.com\n" +
        "• APIs de GIFs online\n\n" +
        "💡 *Dica:* Certifique-se de que a URL aponta diretamente para o arquivo de vídeo!"
    );
  },
};
