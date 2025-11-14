import { delay } from "baileys";
import fs from "node:fs";
import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../../config.js";
import { getBuffer } from "../../../utils/index.js";

export default {
  name: "enviar-imagem-de-buffer",
  description: "Exemplo de como enviar uma imagem a partir de um buffer",
  commands: ["enviar-imagem-de-buffer"],
  usage: `${PREFIX}enviar-imagem-de-buffer`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendImageFromBuffer, sendReact, userLid }) => {
    await sendReact("🖼️");

    await delay(3000);

    await sendReply(
      "Vou enviar uma imagem a partir de um buffer de arquivo local"
    );

    await delay(3000);

    const imageBuffer = fs.readFileSync(
      path.join(ASSETS_DIR, "samples", "sample-image.jpg")
    );

    await sendImageFromBuffer(
      imageBuffer,
      "Esta é uma imagem de um buffer de arquivo local"
    );

    await delay(3000);

    await sendReply("Agora vou enviar uma imagem a partir de um buffer de URL");

    await delay(3000);

    const urlBuffer = await getBuffer(
      "https://api.spiderx.com.br/storage/samples/sample-image.jpg"
    );

    await sendImageFromBuffer(
      urlBuffer,
      "Esta é uma imagem de um buffer de URL"
    );

    await delay(3000);

    await sendReply("Você também pode enviar imagens de buffer sem legenda");

    await delay(3000);

    await sendImageFromBuffer(urlBuffer);

    await delay(3000);

    await sendReply("Agora vou enviar uma imagem de buffer mencionando você:");

    await delay(3000);

    await sendImageFromBuffer(
      urlBuffer,
      `Tá ai a imagem @${userLid.split("@")[0]}!`,
      [userLid]
    );

    await delay(3000);

    await sendReply(
      "Para enviar imagens de buffer, use a função sendImageFromBuffer(buffer, caption, [mentions], quoted).\n\n" +
        "Isso é útil quando você tem imagens processadas em memória ou precisa manipular a imagem antes de enviar."
    );
  },
};
