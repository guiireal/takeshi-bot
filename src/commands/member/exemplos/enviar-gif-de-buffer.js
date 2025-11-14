import { delay } from "baileys";
import fs from "node:fs";
import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../../config.js";
import { getBuffer } from "../../../utils/index.js";

export default {
  name: "enviar-gif-de-buffer",
  description: "Exemplo de como enviar gifs a partir de buffers",
  commands: ["enviar-gif-de-buffer"],
  usage: `${PREFIX}enviar-gif-de-buffer`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendGifFromBuffer, sendReact, userLid }) => {
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
      `@${userLid.split("@")[0]} este gif veio de um buffer!`,
      [userLid]
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
