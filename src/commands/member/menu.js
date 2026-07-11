import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../config.js";
import { menuMessage } from "../../menu.js";
import { getRandomNumber } from "../../utils/index.js";

export default {
  name: "menu",
  description: "Menu de comandos",
  commands: ["menu", "help"],
  usage: `${PREFIX}menu`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    remoteJid,
    sendSuccessReact,
    sendImageFromFile,
    sendGifFromFile,
  }) => {
    await sendSuccessReact();

    const useGif = getRandomNumber(0, 1);
    const send = useGif ? sendGifFromFile : sendImageFromFile;
    const file = useGif
      ? path.join(ASSETS_DIR, "videos", "takeshi-bot.mp4")
      : path.join(ASSETS_DIR, "images", "takeshi-bot.png");

    await send(file, `\n\n${menuMessage(remoteJid)}`);
  },
};
