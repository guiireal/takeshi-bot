import { readFile } from "node:fs/promises";
import path from "node:path";
import { ASSETS_DIR, BOT_EMOJI, BOT_NAME, PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import { download, play } from "../../services/spider-x-api.js";
import {
  processAnimatedGifToSticker,
  processStaticSticker,
} from "../../services/sticker.js";
import {
  ajustAudioByBuffer,
  getRandomName,
  getUserName,
  removeFileIfExists,
} from "../../utils/index.js";

const stickerAudioDirectory = path.join(ASSETS_DIR, "stickeraudio");

async function createVoiceBuffer(source, maxSeconds) {
  const { audioBuffer, audioPath, oldAudioPath } = await ajustAudioByBuffer(
    source,
    true,
    maxSeconds,
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
  handle: async ({
    socket,
    remoteJid,
    webMessage,
    userLid,
    fullArgs,
    downloadAudio,
    downloadImage,
    downloadVideo,
    sendWaitReact,
    sendSuccessReact,
  }) => {
    const search = fullArgs.trim();
    const image = webMessage.message?.imageMessage;

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

        await socket.sendAudioSticker(remoteJid, stickerPath, stickerAudio);
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

      try {
        videoPath = await downloadVideo(webMessage, getRandomName());
        const audioBuffer = await createVoiceBuffer(await readFile(videoPath)).catch(() => {
          throw new WarningError(
            "Não consegui extrair o áudio do vídeo. Verifique se ele tem som.",
          );
        });
        stickerPath = await processAnimatedGifToSticker(videoPath, {
          username: getUserName(webMessage, userLid),
          botName: `${BOT_EMOJI} ${BOT_NAME}`,
        });

        await socket.sendAudioSticker(remoteJid, stickerPath, audioBuffer);
      } finally {
        removeFileIfExists(videoPath);
        removeFileIfExists(stickerPath);
      }

      await sendSuccessReact();
      return;
    }

    let sticker = path.join(stickerAudioDirectory, "leno_brega.webp");
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
    } else if (quoted) {
      const audio = quoted.audioMessage;

      if (!audio?.ptt || audio.viewOnce) {
        throw new InvalidParameterError("Responda a uma mensagem de voz comum.");
      }

      await socket.sendAudioSticker(remoteJid, sticker, audio);
      return;
    } else {
      source = await readFile(
        path.join(stickerAudioDirectory, "trepada_em_cuiaba.mp3"),
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

      const audioBuffer = await createVoiceBuffer(source, search ? 30 : undefined);
      await socket.sendAudioSticker(remoteJid, sticker, audioBuffer);
    } finally {
      removeFileIfExists(imagePath);
      removeFileIfExists(stickerPath);
    }

    if (search) {
      await sendSuccessReact();
    }
  },
};
