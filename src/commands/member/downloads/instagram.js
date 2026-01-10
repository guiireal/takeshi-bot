import { PREFIX } from "../../../config.js";
import { InvalidParameterError, WarningError } from "../../../errors/index.js";
import { download } from "../../../services/spider-x-api.js";
import { errorLog } from "../../../utils/logger.js";

export default {
  name: "instagram",
  description: "Faço o download de vídeos/reels do Instagram",
  commands: ["instagram", "ig", "inst", "insta"],
  usage: `${PREFIX}instagram https://www.instagram.com/reel/Cx789012345/`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    sendVideoFromURL,
    fullArgs,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReply,
  }) => {
    if (!fullArgs.length) {
      throw new InvalidParameterError(
        "Você precisa enviar uma URL do Instagram!"
      );
    }

    await sendWaitReact();

    if (!fullArgs.includes("instagram.com")) {
      throw new WarningError("O link não é do Instagram!");
    }

    try {
      const data = await download("instagram", fullArgs);

      if (!data || !data.url) {
        await sendErrorReply("Nenhum resultado encontrado!");
        return;
      }

      await sendSuccessReact();

      await sendVideoFromURL(data.url);
    } catch (error) {
      errorLog(JSON.stringify(error, null, 2));
      await sendErrorReply(error.message);
    }
  },
};
