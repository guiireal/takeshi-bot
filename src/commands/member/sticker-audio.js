import { readFile, stat } from "node:fs/promises";
import { BOT_EMOJI, BOT_NAME, PREFIX } from "../../config.js";
import { AudioStickerUploadTooLargeError, InvalidParameterError, WarningError } from "../../errors/index.js";
import { download, play } from "../../services/spider-x-api.js";
import {
  processAnimatedGifToSticker,
  processAnimatedSticker,
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

const ANIMATED_STICKER_MAX_BYTES = 990_000;
const ANIMATED_STICKER_RETRY_MAX_BYTES = 499_000;

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
  name: "sticker-audio",
  description: "Envia uma figurinha com áudio.",
  commands: ["stickeraudio", "audiosticker"],
  usage: `Envie uma imagem com a legenda ${PREFIX}stickeraudio Evidências ou ${PREFIX}stickeraudio https://youtu.be/mW8o_WDL91o. Os mesmos comandos funcionam ao responder a uma figurinha.
Use só ${PREFIX}stickeraudio na legenda se a imagem responder a um áudio. Também dá para enviar ou responder a um vídeo de até 10 segundos.`,
  handle: async (params) => {
    const {
      socket, remoteJid, webMessage, userLid, fullArgs,
      downloadAudio, downloadImage, downloadSticker, downloadVideo, sendWaitReact, sendSuccessReact,
    } = params;
    const search = fullArgs.trim();
    const image = webMessage.message?.imageMessage;

    if (image?.viewOnce) {
      throw new InvalidParameterError("Envie uma imagem sem visualização única.");
    }

    const sendSticker = async (sticker, audio, nextSticker) => {
      let compressedAudio = false;
      for (;;) {
        try {
          await socket.sendAudioSticker(remoteJid, sticker, audio);
          return;
        } catch (error) {
          if (!(error instanceof AudioStickerUploadTooLargeError)) throw error;

          if (error.media === "sticker" && nextSticker) {
            sticker = await nextSticker(ANIMATED_STICKER_RETRY_MAX_BYTES);
            if (typeof sticker !== "string") nextSticker = undefined;
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
      const stickerPaths = [];

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
        const encodeSticker = async (profile) => {
          const stickerPath = await processAnimatedGifToSticker(videoPath, metadata, profile);
          stickerPaths.push(stickerPath);
          return stickerPath;
        };
        const fallbackProfiles = [
          { fps: 4 },
          { fps: 1.8 },
          { fps: 6, size: 216, outputSize: 512 },
          { fps: 4, size: 128, outputSize: 512 },
        ];
        const nextSticker = async (maxBytes) => {
          for (let profile = fallbackProfiles.shift(); profile; profile = fallbackProfiles.shift()) {
            const candidate = await encodeSticker(profile);
            if ((await stat(candidate)).size <= maxBytes) return candidate;
          }
          throw new AudioStickerUploadTooLargeError("sticker");
        };

        let stickerPath = await encodeSticker();
        if ((await stat(stickerPath)).size > ANIMATED_STICKER_MAX_BYTES) {
          stickerPath = await nextSticker(ANIMATED_STICKER_MAX_BYTES);
        }
        await sendSticker(stickerPath, audioBuffer, nextSticker);
      } finally {
        removeFileIfExists(videoPath);
        for (const stickerPath of stickerPaths) removeFileIfExists(stickerPath);
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

      let videoId;
      if (/https?:\/\//i.test(search)) {
        const url = URL.parse(search);
        if (url && /^https?:$/.test(url.protocol)) {
          if (/^(www\.)?youtu\.be$/.test(url.hostname)) {
            videoId = url.pathname.match(/^\/([\w-]{11})\/?$/)?.[1];
          } else if (/(^|\.)youtube\.com$/.test(url.hostname)) {
            videoId = url.pathname === "/watch"
              ? url.searchParams.get("v")
              : url.pathname.match(/^\/(?:shorts|embed|live|v)\/([\w-]{11})\/?$/)?.[1];
          }
        }
        if (!videoId || !/^[\w-]{11}$/.test(videoId)) {
          throw new InvalidParameterError("Informe um link válido do YouTube.");
        }
      }

      await sendWaitReact();
      const data = videoId
        ? await download("yt-mp3", `https://www.youtube.com/watch?v=${videoId}`)
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
    let quotedStickerPath;
    let encodeCompactSticker;

    try {
      const metadata = {
        username: getUserName(webMessage, userLid),
        botName: `${BOT_EMOJI} ${BOT_NAME}`,
      };

      if (search && image) {
        imagePath = await downloadImage(webMessage, getRandomName());
        stickerPath = await processStaticSticker(imagePath, metadata);
        sticker = stickerPath;
      } else if (search && sticker) {
        // Renomeia pack/autor da figurinha citada; se não der, segue com a original como antes.
        const original = sticker;
        try {
          quotedStickerPath = await downloadSticker(webMessage, getRandomName());
          if (quotedStickerPath) {
            // Apesar do nome, só grava o EXIF sem recodificar: serve para figurinha estática e animada.
            stickerPath = await processAnimatedSticker(quotedStickerPath, metadata);
            sticker = stickerPath;
            encodeCompactSticker = async () => original;
          }
        } catch {
          sticker = original;
        }
      }

      const audioBuffer = await createVoiceBuffer(source, 30);
      await sendSticker(sticker, audioBuffer, encodeCompactSticker);
    } finally {
      removeFileIfExists(imagePath);
      removeFileIfExists(stickerPath);
      removeFileIfExists(quotedStickerPath);
    }

    await sendSuccessReact();
  },
};
