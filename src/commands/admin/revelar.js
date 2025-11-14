import { exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { PREFIX, TEMP_DIR } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { getRandomName } from "../../utils/index.js";

export default {
  name: "revelar",
  description: "Revela uma imagem ou vídeo com visualização única",
  commands: ["revelar", "rv", "reveal"],
  usage: `${PREFIX}revelar (marque a imagem/vídeo) ou ${PREFIX}revelar (responda a imagem/vídeo).`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    isImage,
    isVideo,
    downloadImage,
    downloadVideo,
    webMessage,
    sendSuccessReact,
    sendWaitReact,
    sendImageFromFile,
    sendVideoFromFile,
  }) => {
    if (!isImage && !isVideo) {
      throw new InvalidParameterError(
        "Você precisa marcar uma imagem/vídeo ou responder a uma imagem/vídeo para revelá-la"
      );
    }

    await sendWaitReact();

    const mediaCaption = `Aqui está sua ${
      isImage ? "imagem" : "vídeo"
    } revelada!`;

    const outputPath = path.resolve(
      TEMP_DIR,
      `${getRandomName()}.${isImage ? "jpg" : "mp4"}`
    );

    let inputPath;

    try {
      if (isImage) {
        inputPath = await downloadImage(webMessage, "input");

        await new Promise((resolve, reject) => {
          exec(
            `ffmpeg -y -i "${inputPath}" -q:v 2 "${outputPath}"`,
            (error) => {
              if (error) {
                console.error("Erro FFmpeg:", error);
                reject(error);
              } else {
                sendImageFromFile(outputPath, mediaCaption).then(() => {
                  sendSuccessReact().then(resolve);
                });
              }
            }
          );
        });
      } else if (isVideo) {
        inputPath = await downloadVideo(webMessage, "input");

        await new Promise((resolve, reject) => {
          exec(
            `ffmpeg -y -i "${inputPath}" -c copy "${outputPath}"`,
            (error) => {
              if (error) {
                console.error("Erro FFmpeg:", error);
                reject(error);
              } else {
                sendVideoFromFile(outputPath, mediaCaption).then(() => {
                  sendSuccessReact().then(resolve);
                });
              }
            }
          );
        });
      }
    } catch (error) {
      console.error("Erro geral:", error);
      throw new Error("Ocorreu um erro ao processar a mídia. Tente novamente.");
    } finally {
      const cleanFile = (filePath) => {
        if (filePath && fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (cleanError) {
            console.error("Erro ao limpar arquivo:", cleanError);
          }
        }
      };

      cleanFile(inputPath);
      cleanFile(outputPath);
    }
  },
};
