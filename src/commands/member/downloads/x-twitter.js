import { PREFIX } from "../../../config.js";
import { InvalidParameterError, WarningError } from "../../../errors/index.js";
import { xTwitter } from "../../../services/spider-x-api.js";
import { errorLog } from "../../../utils/logger.js";

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|mkv)(\?|$)/i;

export default {
  name: "x-twitter",
  description: "Faço o download de vídeos ou imagens do X (Twitter)",
  commands: ["xtwitter", "twitter", "x"],
  usage: `${PREFIX}xtwitter https://x.com/usuario/status/1234567890`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    sendVideoFromURL,
    sendImageFromURL,
    fullArgs,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReply,
  }) => {
    if (!fullArgs.length) {
      throw new InvalidParameterError(
        "Você precisa enviar uma URL do X (Twitter)!",
      );
    }

    await sendWaitReact();

    if (!fullArgs.includes("x.com") && !fullArgs.includes("twitter.com")) {
      throw new WarningError("O link não é do X (Twitter)!");
    }

    try {
      const data = await xTwitter(fullArgs);

      if (!data || !data.url) {
        await sendErrorReply("Nenhum resultado encontrado!");
        return;
      }

      await sendSuccessReact();

      if (VIDEO_EXTENSIONS.test(data.url)) {
        await sendVideoFromURL(data.url);
        return;
      }

      await sendImageFromURL(data.url);
    } catch (error) {
      errorLog(JSON.stringify(error, null, 2));
      await sendErrorReply(error.message);
    }
  },
};
