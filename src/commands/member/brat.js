import fs from "node:fs";
import path from "node:path";
import { BOT_EMOJI, BOT_NAME, PREFIX, TEMP_DIR } from "../../config.js";
import { brat } from "../../services/spider-x-api.js";
import { processStaticSticker } from "../../services/sticker.js";
import { parseBratArgs } from "../../utils/bratOptions.js";
import { getRandomName } from "../../utils/index.js";

export default {
  name: "brat",
  description: "Gera imagem no estilo brat com o texto informado.",
  commands: ["brat"],
  usage: `${PREFIX}brat Nem judas mentiu tanto assim ☠️ / verde / centro / branco`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    sendWaitReact,
    args,
    sendStickerFromFile,
    sendSuccessReact,
    sendErrorReply,
    webMessage,
    userLid,
  }) => {
    const { text, options } = parseBratArgs(args, PREFIX, "brat");

    await sendWaitReact();

    const url = await brat(text, options);

    const response = await fetch(url);

    if (!response.ok) {
      const data = await response.json();

      await sendErrorReply(
        `Ocorreu um erro ao executar uma chamada remota para a Spider X API no comando brat!\n      \n📄 *Detalhes*: ${data.message}`,
      );
      return;
    }

    let inputPath = null;
    let finalStickerPath = null;

    try {
      inputPath = path.resolve(TEMP_DIR, getRandomName("png"));

      const imageBuffer = Buffer.from(await response.arrayBuffer());
      await fs.promises.writeFile(inputPath, imageBuffer);

      const username =
        webMessage.pushName ||
        webMessage.notifyName ||
        userLid.replace(/@lid/, "");

      const metadata = {
        username,
        botName: `${BOT_EMOJI} ${BOT_NAME}`,
      };

      finalStickerPath = await processStaticSticker(inputPath, metadata);

      await sendSuccessReact();

      await sendStickerFromFile(finalStickerPath);
    } finally {
      if (inputPath && fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath);
      }

      if (finalStickerPath && fs.existsSync(finalStickerPath)) {
        fs.unlinkSync(finalStickerPath);
      }
    }
  },
};
