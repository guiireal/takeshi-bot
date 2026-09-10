import { delay } from "zapo-js";
import { PREFIX } from "../../../config.js";

export default {
  name: "enviar-album-de-url",
  description: "Exemplo de como enviar um álbum a partir de URLs",
  commands: ["enviar-album-de-url"],
  usage: `${PREFIX}enviar-album-de-url`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendAlbumFromURLs, sendReply, sendReact }) => {
    await sendReact("🖼️");

    await delay(3000);

    await sendReply("Vou enviar um álbum a partir de URLs");

    await delay(3000);

    await sendAlbumFromURLs(
      [
        "https://api.spiderx.com.br/storage/samples/sample-image.jpg",
        "https://api.spiderx.com.br/assets/images/logo.png",
        "https://api.spiderx.com.br/storage/samples/sample-image.jpg",
      ],
      "Este é um álbum de URLs",
    );

    await delay(3000);

    await sendReply("Você também pode enviar um álbum de URLs sem legenda:");

    await delay(3000);

    await sendAlbumFromURLs([
      "https://api.spiderx.com.br/storage/samples/sample-image.jpg",
      "https://api.spiderx.com.br/assets/images/logo.png",
    ]);

    await delay(3000);

    await sendReply(
      "Para enviar álbuns de URL, use a função sendAlbumFromURLs(urls, caption, [mentions]).\n\n" +
        "Você pode enviar álbuns de arquivos, buffers ou URLs. Isso é útil quando você tem imagens hospedadas online ou obtidas de APIs.",
    );
  },
};
