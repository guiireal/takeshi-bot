import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { play } from "../../../services/spider-x-api.js";
import {
  formatSecondsToMinutesAndSeconds,
  getRandomNumber,
} from "../../../utils/index.js";

export default {
  name: "play-audio",
  description: "Faço o download de músicas",
  commands: ["play-audio", "play", "pa"],
  usage: `${PREFIX}play-audio MC Hariel`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    sendAudioFromURL,
    sendImageFromURL,
    fullArgs,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReply,
  }) => {
    if (!fullArgs.length) {
      throw new InvalidParameterError(
        "Você precisa me dizer o que deseja buscar!",
      );
    }

    if (fullArgs.includes("http://") || fullArgs.includes("https://")) {
      throw new InvalidParameterError(
        `Você não pode usar links para baixar músicas! Use ${PREFIX}yt-mp3 link`,
      );
    }

    await sendWaitReact();

    const data = await play("audio", fullArgs);

    if (!data) {
      await sendErrorReply("Nenhum resultado encontrado!");
      return;
    }

    await sendSuccessReact();

    const randomSeconds = getRandomNumber(10, 20);
    const videoDuration = formatSecondsToMinutesAndSeconds(
      data.total_duration_in_seconds,
    );

    await sendImageFromURL(
      data.thumbnail,
      `*Título*: ${data.title}
        
*Descrição*: ${data.description}
*Canal*: ${data.channel.name}

> 0:${randomSeconds} ━━●──────${videoDuration} ↻ ⊲ Ⅱ ⊳ ↺
> ılı.lıllılı.ıllı..ılı.lıllılı.ıllı`,
    );

    await sendAudioFromURL(data.url);
  },
};
