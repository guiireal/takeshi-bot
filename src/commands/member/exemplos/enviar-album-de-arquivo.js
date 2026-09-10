import { delay } from "zapo-js";
import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../../config.js";

export default {
  name: "enviar-album-de-arquivo",
  description: "Exemplo de como enviar um álbum a partir de arquivos locais",
  commands: ["enviar-album-de-arquivo"],
  usage: `${PREFIX}enviar-album-de-arquivo`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendAlbumFromFiles, sendReply, sendReact }) => {
    await sendReact("🖼️");

    await delay(3000);

    await sendReply("Vou enviar um álbum a partir de arquivos locais");

    await delay(3000);

    await sendAlbumFromFiles(
      [
        path.join(ASSETS_DIR, "samples", "sample-image.jpg"),
        path.join(ASSETS_DIR, "images", "takeshi-bot.png"),
        path.join(ASSETS_DIR, "images", "guia-de-comandos.png"),
      ],
      "Este é um álbum de arquivos locais",
    );

    await delay(3000);

    await sendReply("Você também pode enviar um álbum de arquivos sem legenda:");

    await delay(3000);

    await sendAlbumFromFiles([
      path.join(ASSETS_DIR, "samples", "sample-image.jpg"),
      path.join(ASSETS_DIR, "images", "takeshi-bot.png"),
    ]);

    await delay(3000);

    await sendReply(
      "Para enviar álbuns de arquivo, use a função sendAlbumFromFiles(files, caption, [mentions]).\n\n" +
        "Você pode enviar álbuns de arquivos, buffers ou URLs. Isso é útil quando você tem imagens armazenadas localmente no servidor.",
    );
  },
};
