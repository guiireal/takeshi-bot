import { delay } from "zapo-js";
import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../../config.js";

export default {
  name: "enviar-imagem-de-arquivo",
  description: "Exemplo de como enviar uma imagem a partir de um arquivo local",
  commands: ["enviar-imagem-de-arquivo"],
  usage: `${PREFIX}enviar-imagem-de-arquivo`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendImageFromFile, sendReact, userLid }) => {
    await sendReact("🖼️");

    await delay(3000);

    await sendReply("Vou enviar uma imagem a partir de um arquivo local");

    await delay(3000);

    await sendImageFromFile(
      path.join(ASSETS_DIR, "samples", "sample-image.jpg"),
      "Esta é uma legenda opcional para a imagem"
    );

    await delay(3000);

    await sendReply("Você também pode enviar imagens sem legenda:");

    await delay(3000);

    await sendImageFromFile(
      path.join(ASSETS_DIR, "samples", "sample-image.jpg")
    );

    await delay(3000);

    await sendReply("Ou usar outras imagens do projeto:");

    await delay(3000);

    await sendImageFromFile(
      path.join(ASSETS_DIR, "images", "takeshi-bot.png"),
      "Logo do Takeshi Bot!"
    );

    await delay(3000);

    await sendReply("Agora vou enviar uma imagem de arquivo mencionando você:");

    await delay(3000);

    await sendImageFromFile(
      path.join(ASSETS_DIR, "images", "takeshi-bot.png"),
      `Logo do Takeshi Bot para você @${userLid.split("@")[0]}!`,
      [userLid]
    );

    await delay(3000);

    await sendReply(
      "Para enviar imagens de arquivo, use a função sendImageFromFile(filePath, caption, [mentions], quoted).\n\n" +
        "Isso é útil quando você tem imagens armazenadas localmente no servidor."
    );
  },
};
