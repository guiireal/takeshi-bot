import { PREFIX } from "../../../config.js";
import { InvalidParameterError, WarningError } from "../../../errors/index.js";
import { download } from "../../../services/spider-x-api.js";
import { errorLog } from "../../../utils/logger.js";

export default {
  name: "yt-mp4",
  description: "Faço o download de áudios do YouTube pelo link!",
  commands: ["yt-mp4", "youtube-mp4", "yt-video", "youtube-video", "mp4"],
  usage: `${PREFIX}yt-mp4 https://www.youtube.com/watch?v=mW8o_WDL91o`,
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
        "Você precisa enviar uma URL do YouTube!"
      );
    }

    await sendWaitReact();

    if (!fullArgs.includes("you")) {
      throw new WarningError("O link não é do YouTube!");
    }

    try {
      const data = await download("yt-mp4", fullArgs);

      if (!data) {
        await sendErrorReply("Nenhum resultado encontrado!");
        return;
      }

      await sendSuccessReact();

      await sendImageFromURL(
        data.thumbnail,
        `*Título*: ${data.title}
        
*Descrição*: ${data.description}
*Duração em segundos*: ${data.total_duration_in_seconds}
*Canal*: ${data.channel.name}`
      );

      await sendVideoFromURL(data.url);
    } catch (error) {
      errorLog(JSON.stringify(error, null, 2));
      await sendErrorReply(error.message);
    }
  },
};
