import fs from "fs/promises";
import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { toGif } from "../../services/spider-x-api.js";
import { getRandomName } from "../../utils/index.js";

export default {
  name: "togif",
  description: "Transformo figurinhas animadas em GIF",
  commands: ["togif", "gif"],
  usage: `${PREFIX}togif (marque a figurinha)`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    isSticker,
    downloadSticker,
    webMessage,
    sendWaitReact,
    sendSuccessReact,
    sendGifFromURL,
  }) => {
    if (!isSticker) {
      throw new InvalidParameterError("Você precisa enviar uma figurinha!");
    }

    await sendWaitReact();

    const stickerPath = await downloadSticker(webMessage, getRandomName());

    const stickerBuffer = await fs.readFile(stickerPath);

    const gifUrl = await toGif(stickerBuffer);

    await sendSuccessReact();

    await sendGifFromURL(gifUrl);
  },
};
