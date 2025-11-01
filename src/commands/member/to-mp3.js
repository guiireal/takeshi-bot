const { PREFIX, TEMP_DIR } = require(`${BASE_DIR}/config`);
const { exec } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { getRandomNumber, getRandomName } = require(`${BASE_DIR}/utils`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

async function extractAudio(videoPath) {
  const audioPath = path.resolve(
    TEMP_DIR,
    `${getRandomNumber(10_000, 99_999)}.aac`
  );

  return new Promise((resolve, reject) => {
    exec(
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

module.exports = {
  name: "to-mp3",
  description: "Converte vídeos para áudio MP3!",
  commands: ["to-mp3", "video2mp3", "mp3"],
  usage: `${PREFIX}to-mp3 (envie em cima de um vídeo ou responda um vídeo)`,

  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
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
