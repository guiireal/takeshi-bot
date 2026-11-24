import { exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { PREFIX, TEMP_DIR } from "../../config.js";
import {
  DangerError,
  InvalidParameterError,
  WarningError,
} from "../../errors/index.js";
import { getRandomName } from "../../utils/index.js";
import { getViewOnceMessage } from "../../utils/viewOnceCache.js";

export default {
  name: "revelar",
  description: "Revela texto, imagem, vídeo ou áudio com visualização única",
  commands: ["revelar", "rv", "reveal"],
  usage: `${PREFIX}revelar (responda ao texto, imagem, vídeo ou áudio).`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    isImage,
    isVideo,
    isAudio,
    downloadImage,
    downloadVideo,
    downloadAudio,
    webMessage,
    sendSuccessReact,
    sendWaitReact,
    sendImageFromFile,
    sendVideoFromFile,
    sendAudioFromFile,
    sendReply,
  }) => {
    if (!isImage && !isVideo && !isAudio) {
      const contextInfo = webMessage?.message?.extendedTextMessage?.contextInfo;
      const quotedMessage = contextInfo?.quotedMessage;
      const content =
        quotedMessage?.viewOnceMessage?.message ||
        quotedMessage?.viewOnceMessageV2?.message ||
        quotedMessage?.viewOnceMessageV2Extension?.message ||
        quotedMessage;
      const text =
        content?.conversation ||
        content?.extendedTextMessage?.text ||
        (content?.extendedTextMessage?.viewOnce &&
          getViewOnceMessage({
            chatJid: webMessage?.key?.remoteJid,
            id: contextInfo?.stanzaId,
            type: "extendedTextMessage",
          })?.text);

      if (text) {
        await sendReply(text);
        await sendSuccessReact();
        return;
      }

      if (content?.extendedTextMessage?.viewOnce) {
        throw new WarningError(
          "O texto não está disponível. Só consigo revelar textos que recebi nos últimos 30 minutos, sem reiniciar o bot."
        );
      }

      throw new InvalidParameterError(
        "Você precisa responder a um texto, imagem, vídeo ou áudio para revelar a mensagem"
      );
    }

    await sendWaitReact();

    const mediaCaption = `Aqui está sua ${
      isImage ? "imagem" : "vídeo"
    } revelada!`;

    const outputPath = isAudio
      ? undefined
      : path.resolve(TEMP_DIR, `${getRandomName()}.${isImage ? "jpg" : "mp4"}`);

    let inputPath;

    try {
      if (isAudio) {
        inputPath = await downloadAudio(webMessage, getRandomName());

        if (!inputPath) {
          throw new WarningError(
            "Não consegui obter o áudio. Responda diretamente à mensagem original e tente novamente."
          );
        }

        await sendAudioFromFile(inputPath);
        await sendSuccessReact();
      } else if (isImage) {
        inputPath = await downloadImage(webMessage, "input");

        await new Promise((resolve, reject) => {
          exec(
            `ffmpeg -y -i "${inputPath}" -q:v 2 "${outputPath}"`,
            (error) => {
              if (error) {
                console.error("Erro FFmpeg:", error);
                reject(error);
              } else {
                resolve();
              }
            }
          );
        });
        await sendImageFromFile(outputPath, mediaCaption);
        await sendSuccessReact();
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
                resolve();
              }
            }
          );
        });
        await sendVideoFromFile(outputPath, mediaCaption);
        await sendSuccessReact();
      }
    } catch (error) {
      if (error instanceof WarningError) {
        throw error;
      }

      console.error("Erro geral:", error);
      throw new DangerError("Ocorreu um erro ao processar a mídia. Tente novamente.");
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
