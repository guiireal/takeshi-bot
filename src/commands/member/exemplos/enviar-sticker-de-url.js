import { delay } from "zapo-js";
import { PREFIX } from "../../../config.js";

export default {
  name: "enviar-sticker-de-url",
  description: "Exemplo de como enviar um sticker a partir de uma URL",
  commands: ["enviar-sticker-de-url"],
  usage: `${PREFIX}enviar-sticker-de-url`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendStickerFromURL, sendReact }) => {
    await sendReact("🏷️");

    await delay(3000);

    await sendReply("Vou enviar um sticker a partir de uma URL");

    await delay(3000);

    await sendStickerFromURL(
      "https://api.spiderx.com.br/storage/samples/sample-sticker.webp"
    );

    await delay(3000);

    await sendReply(
      "Para enviar stickers de URL, use a função sendStickerFromURL(url, quoted).\n\n" +
        "Isso é útil quando você tem stickers hospedados online ou obtidos de APIs."
    );

    await delay(3000);

    await sendReply(
      "💡 *Dica:* Certifique-se de que a URL aponta para um arquivo .webp válido para garantir compatibilidade."
    );
  },
};
