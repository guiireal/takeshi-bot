import { PREFIX } from "../../../config.js";
import { InvalidParameterError, WarningError } from "../../../errors/index.js";
import { facebook } from "../../../services/spider-x-api.js";
import { errorLog } from "../../../utils/logger.js";

export default {
  name: "facebook",
  description: "Faço o download de vídeos do Facebook",
  commands: ["facebook", "fb"],
  usage: `${PREFIX}facebook https://www.facebook.com/reel/123456789012345`,
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
        "Você precisa enviar uma URL do Facebook!",
      );
    }

    await sendWaitReact();

    if (!fullArgs.includes("facebook.com") && !fullArgs.includes("fb.watch")) {
      throw new WarningError("O link não é do Facebook!");
    }

    try {
      const data = await facebook(fullArgs);

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
