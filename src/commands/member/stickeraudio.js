import { readFile, stat } from "node:fs/promises";
import { BOT_EMOJI, BOT_NAME, PREFIX } from "../../config.js";
import { AudioStickerUploadTooLargeError, InvalidParameterError, WarningError } from "../../errors/index.js";
import { download, play } from "../../services/spider-x-api.js";
import {
  processAnimatedGifToSticker,
  processStaticSticker,
} from "../../services/sticker.js";
import {
  ajustAudioByBuffer,
  getRandomName,
  getUserName,
  hasAudioStream,
  removeFileIfExists,
} from "../../utils/index.js";
import stickerCommand from "./sticker.js";

const ANIMATED_STICKER_MAX_BYTES = 499_000;

async function createVoiceBuffer(source, maxSeconds, bitrateKbps) {
  const { audioBuffer, audioPath, oldAudioPath } = await ajustAudioByBuffer(
    source,
    true,
    maxSeconds,
    bitrateKbps,
  );
  removeFileIfExists(audioPath);
  removeFileIfExists(oldAudioPath);
  return audioBuffer;
}

export default {
  name: "stickeraudio",
  description: "Envia uma figurinha com áudio.",
  commands: ["stickeraudio", "audiosticker"],
  usage: `${PREFIX}stickeraudio <música ou link do YouTube> (responda a uma figurinha ou envie uma imagem com a legenda) ou ${PREFIX}stickeraudio (envie ou responda a um vídeo de até 10 segundos)`,
  handle: async (params) => {
    const {
      socket, remoteJid, webMessage, userLid, fullArgs,
      downloadAudio, downloadImage, downloadVideo, sendWaitReact, sendSuccessReact,
    } = params;
    const search = fullArgs.trim();
    const image = webMessage.message?.imageMessage;

    const sendSticker = async (sticker, audio, encodeCompactSticker) => {
      let compressedAudio = false;
      for (;;) {
        try {
          await socket.sendAudioSticker(remoteJid, sticker, audio);
          return;
        } catch (error) {
          if (!(error instanceof AudioStickerUploadTooLargeError)) throw error;

          if (error.media === "sticker" && encodeCompactSticker) {
            sticker = await encodeCompactSticker();
            encodeCompactSticker = undefined;
          } else if (error.media === "ptt" && audio instanceof Uint8Array && !compressedAudio) {
            audio = await createVoiceBuffer(audio, undefined, 24);
            compressedAudio = true;
          } else {
            throw error;
          }
        }
      }
    };

    if (!search && image) {
      const quoted = image.contextInfo?.quotedMessage;
      const audio = quoted?.audioMessage;

      if (!audio || audio.viewOnce) {
        throw new InvalidParameterError(
          "Responda a um áudio com a imagem e o comando na legenda.",
        );
      }

      await sendWaitReact();
      let imagePath;
      let audioPath;
      let stickerPath;

      try {
        imagePath = await downloadImage(webMessage, getRandomName());
        stickerPath = await processStaticSticker(imagePath, {
          username: getUserName(webMessage, userLid),
          botName: `${BOT_EMOJI} ${BOT_NAME}`,
        });

        let stickerAudio = audio;

        if (!audio.ptt) {
          audioPath = await downloadAudio(
            { ...webMessage, message: quoted },
            getRandomName(),
          );
          stickerAudio = await createVoiceBuffer(await readFile(audioPath));
        }

        await sendSticker(stickerPath, stickerAudio);
      } finally {
        removeFileIfExists(imagePath);
        removeFileIfExists(audioPath);
        removeFileIfExists(stickerPath);
      }

      await sendSuccessReact();
      return;
    }

    const quoted =
      webMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const video = webMessage.message?.videoMessage || quoted?.videoMessage;

    if (!search && video) {
      if (video.viewOnce) {
        throw new InvalidParameterError("Envie um vídeo sem visualização única.");
      }

      if (!video.seconds || video.seconds > 10) {
        throw new InvalidParameterError("Envie um vídeo de até 10 segundos.");
      }

      await sendWaitReact();
      let videoPath;
      let stickerPath;
      let compactPath;

      try {
        videoPath = await downloadVideo(webMessage, getRandomName());
        const videoBuffer = await readFile(videoPath);
        let audioBuffer;
        try {
          audioBuffer = await createVoiceBuffer(videoBuffer);
        } catch {
          if (await hasAudioStream(videoPath).catch(() => undefined) === false) {
            return await stickerCommand.handle({
              ...params,
              isImage: false,
              isVideo: true,
              sendWaitReact: async () => {},
              downloadVideo: async () => videoPath,
            });
          }
          throw new WarningError(
            "Não consegui extrair o áudio do vídeo. Verifique se ele tem som.",
          );
        }
        const metadata = {
          username: getUserName(webMessage, userLid),
          botName: `${BOT_EMOJI} ${BOT_NAME}`,
        };
        const encodeCompactSticker = async () => {
          compactPath = await processAnimatedGifToSticker(videoPath, metadata, true);
          if ((await stat(compactPath)).size > ANIMATED_STICKER_MAX_BYTES) {
            throw new AudioStickerUploadTooLargeError("sticker");
          }
          return compactPath;
        };

        stickerPath = await processAnimatedGifToSticker(videoPath, metadata);
        if ((await stat(stickerPath)).size > ANIMATED_STICKER_MAX_BYTES) {
          await sendSticker(await encodeCompactSticker(), audioBuffer);
        } else {
          await sendSticker(stickerPath, audioBuffer, encodeCompactSticker);
        }
      } finally {
        removeFileIfExists(videoPath);
        removeFileIfExists(stickerPath);
        removeFileIfExists(compactPath);
      }

      await sendSuccessReact();
      return;
    }

    let sticker = quoted?.stickerMessage;
    let source;

    if (search) {
      sticker = quoted?.stickerMessage;

      if (!sticker && !image) {
        throw new InvalidParameterError(
          "Responda a uma figurinha ou envie uma imagem com o comando na legenda para usar a música.",
        );
      }

      const isUrl = /https?:\/\//i.test(search);

      if (
        isUrl &&
        (!URL.canParse(search) ||
          !/(^|\.)youtube\.com$|^youtu\.be$/i.test(new URL(search).hostname))
      ) {
        throw new InvalidParameterError("Informe um link válido do YouTube.");
      }

      await sendWaitReact();
      const data = isUrl
        ? await download("yt-mp3", search)
        : await play("audio", search);

      if (!data?.url) {
        throw new WarningError("Nenhum resultado encontrado!");
      }

      const response = await fetch(data.url, {
        signal: AbortSignal.timeout(60_000),
      });

      if (!response.ok) {
        throw new WarningError("Não consegui baixar o áudio dessa música.");
      }

      source = Buffer.from(await response.arrayBuffer());
    } else {
      throw new InvalidParameterError(
        "Envie uma imagem respondendo a um áudio ou envie/responda a um vídeo com som.",
      );
    }

    let imagePath;
    let stickerPath;

    try {
      if (search && image) {
        imagePath = await downloadImage(webMessage, getRandomName());
        stickerPath = await processStaticSticker(imagePath, {
          username: getUserName(webMessage, userLid),
          botName: `${BOT_EMOJI} ${BOT_NAME}`,
        });
        sticker = stickerPath;
      }

      const audioBuffer = await createVoiceBuffer(source, 30);
      await sendSticker(sticker, audioBuffer);
    } finally {
      removeFileIfExists(imagePath);
      removeFileIfExists(stickerPath);
    }

    await sendSuccessReact();
  },
};
