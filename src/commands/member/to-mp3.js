import { exec as execChild } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { PREFIX, TEMP_DIR } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { getRandomName, getRandomNumber } from "../../utils/index.js";

async function extractAudio(videoPath) {
  const audioPath = path.resolve(
    TEMP_DIR,
    `${getRandomNumber(10_000, 99_999)}.aac`
  );

  return new Promise((resolve, reject) => {
    execChild(
      `ffmpeg -i ${videoPath} -vn -acodec copy ${audioPath}`,
      async (error) => {
        fs.unlinkSync(videoPath);

        if (error) {
          console.log(error);
          reject(error);
        }

        resolve(audioPath);
      }
    );
  });
}

export default {
  name: "to-mp3",
  description: "Converte vídeos para áudio MP3!",
  commands: ["to-mp3", "video2mp3", "mp3"],
  usage: `${PREFIX}to-mp3 (envie em cima de um vídeo ou responda um vídeo)`,

  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    isVideo,
    webMessage,
    sendWaitReact,
    sendSuccessReact,
    sendAudioFromFile,
    downloadVideo,
  }) => {
    if (!isVideo) {
      throw new InvalidParameterError(
        "Por favor, envie este comando em resposta a um vídeo ou com um vídeo anexado."
      );
    }

    await sendWaitReact();

    const videoPath = await downloadVideo(webMessage, getRandomName());

    const output = await extractAudio(videoPath);

    await sendSuccessReact();
    await sendAudioFromFile(output);

    fs.unlinkSync(output);
  },
};
