import { delay } from "zapo-js";
import fs from "node:fs";
import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../../config.js";
import { getBuffer } from "../../../utils/index.js";

export default {
  name: "enviar-album-de-buffer",
  description: "Exemplo de como enviar um álbum a partir de buffers",
  commands: ["enviar-album-de-buffer"],
  usage: `${PREFIX}enviar-album-de-buffer`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendAlbumFromBuffer, sendReply, sendReact }) => {
    await sendReact("🖼️");

    await delay(3000);

    await sendReply("Vou enviar um álbum a partir de buffers de arquivos locais");

    await delay(3000);

    const localBuffers = [
      fs.readFileSync(path.join(ASSETS_DIR, "samples", "sample-image.jpg")),
      fs.readFileSync(path.join(ASSETS_DIR, "images", "takeshi-bot.png")),
      fs.readFileSync(path.join(ASSETS_DIR, "images", "guia-de-comandos.png")),
    ];

    await sendAlbumFromBuffer(localBuffers, "Este é um álbum de buffers locais");

    await delay(3000);

    await sendReply("Agora vou enviar um álbum a partir de buffers de URLs");

    await delay(3000);

    const urlBuffers = [
      await getBuffer(
        "https://api.spiderx.com.br/storage/samples/sample-image.jpg"
      ),
      await getBuffer("https://api.spiderx.com.br/assets/images/logo.png"),
    ];

    await sendAlbumFromBuffer(urlBuffers, "Este é um álbum de buffers de URLs");

    await delay(3000);

    await sendReply("Você também pode enviar um álbum de buffers sem legenda:");

    await delay(3000);

    await sendAlbumFromBuffer(urlBuffers);

    await delay(3000);

    await sendReply(
      "Para enviar álbuns de buffer, use a função sendAlbumFromBuffer(buffers, caption, [mentions]).\n\n" +
        "Você pode enviar álbuns de arquivos, buffers ou URLs. Isso é útil quando você tem imagens processadas em memória.",
    );
  },
};
