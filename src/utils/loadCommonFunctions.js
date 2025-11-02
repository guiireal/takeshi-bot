/**
 * Funções comuns de uso geral
 * do bot. Não há
 * necessidade de modificar
 * este arquivo.
 *
 * @author Dev Gui
 */
const { BOT_EMOJI, TIMEOUT_IN_MILLISECONDS_BY_EVENT } = require("../config");
const {
  extractDataFromMessage,
  baileysIs,
  download,
  onlyNumbers,
  removeFileWithTimeout,
  ajustAudioByBuffer,
} = require(".");
const fs = require("node:fs");
const { delay } = require("baileys");

exports.loadCommonFunctions = ({ socket, webMessage }) => {
  const {
    args,
    commandName,
    fullArgs,
    fullMessage,
    isReply,
    prefix,
    remoteJid,
    replyJid,
    userJid,
    replyText,
  } = extractDataFromMessage(webMessage);

  if (!remoteJid) {
    return null;
  }

  const isAudio = baileysIs(webMessage, "audio");
  const isImage = baileysIs(webMessage, "image");
  const isVideo = baileysIs(webMessage, "video");
  const isSticker = baileysIs(webMessage, "sticker");

  const withRetry = async (fn, maxRetries = 3, delayMs = 1000) => {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        console.warn(
          `Tentativa ${attempt}/${maxRetries} falhou:`,
          error.message
        );

        if (attempt < maxRetries) {
          await delay(delayMs * attempt);
        }
      }
    }

    throw new Error(
      `Falha após ${maxRetries} tentativas. Último erro: ${lastError.message}`
    );
  };

  const sendTypingState = async (anotherJid = "") => {
    const sendToJid = anotherJid || remoteJid;

    await socket.sendPresenceUpdate("composing", sendToJid);

    await delay(TIMEOUT_IN_MILLISECONDS_BY_EVENT);
  };

  const sendRecordState = async (anotherJid = "") => {
    const sendToJid = anotherJid || remoteJid;

    await socket.sendPresenceUpdate("recording", sendToJid);

    await delay(TIMEOUT_IN_MILLISECONDS_BY_EVENT);
  };

  const downloadAudio = async (webMessage, fileName) => {
    return await download(webMessage, fileName, "audio", "mpeg");
  };

  const downloadImage = async (webMessage, fileName) => {
    return await download(webMessage, fileName, "image", "png");
  };

  const downloadSticker = async (webMessage, fileName) => {
    return await download(webMessage, fileName, "sticker", "webp");
  };

  const downloadVideo = async (webMessage, fileName) => {
    return await download(webMessage, fileName, "video", "mp4");
  };

  const sendText = async (text, mentions) => {
    await sendTypingState();

    let optionalParams = {};

    if (mentions?.length) {
      optionalParams = { mentions };
    }

    return await socket.sendMessage(remoteJid, {
      text: `${BOT_EMOJI} ${text}`,
      ...optionalParams,
    });
  };

  const sendEditedText = async (text, messageToEdit, mentions) => {
    let optionalParams = {};

    if (mentions?.length) {
      optionalParams = { mentions };
    }

    return await socket.sendMessage(remoteJid, {
      text: `${BOT_EMOJI} ${text}`,
      ...optionalParams,
      edit: messageToEdit.key,
    });
  };

  const sendReply = async (text, mentions) => {
    await sendTypingState();

    let optionalParams = {};

    if (mentions?.length) {
      optionalParams = { mentions };
    }

    return await socket.sendMessage(
      remoteJid,
      { text: `${BOT_EMOJI} ${text}`, ...optionalParams },
      { quoted: webMessage }
    );
  };

  const sendEditedReply = async (text, messageToEdit, mentions) => {
    let optionalParams = {};

    if (mentions?.length) {
      optionalParams = { mentions };
    }

    return await socket.sendMessage(
      remoteJid,
      {
        text: `${BOT_EMOJI} ${text}`,
        ...optionalParams,
        edit: messageToEdit.key,
      },
      { quoted: webMessage }
    );
  };

  const sendContact = async (phoneNumber, displayName) => {
    const phoneNumberHidrated = onlyNumbers(phoneNumber);

    const vcard =
      "BEGIN:VCARD\n" +
      "VERSION:3.0\n" +
      `FN:${displayName}\n` +
      `TEL;type=CELL;type=VOICE;waid=${phoneNumberHidrated}:${phoneNumber}\n` +
      "END:VCARD";

    await socket.sendMessage(remoteJid, {
      contacts: {
        displayName,
        contacts: [{ vcard }],
      },
    });
  };

  const sendLocation = async (latitude, longitude) => {
    await socket.sendMessage(remoteJid, {
      location: {
        degreesLatitude: latitude,
        degreesLongitude: longitude,
      },
    });
  };

  const sendReact = async (emoji, msgKey = webMessage.key) => {
    return await socket.sendMessage(remoteJid, {
      react: {
        text: emoji,
        key: msgKey,
      },
    });
  };

  const sendSuccessReact = async () => {
    return await sendReact("✅");
  };

  const sendWaitReact = async () => {
    return await sendReact("⏳");
  };

  const sendWarningReact = async () => {
    return await sendReact("⚠️");
  };

  const sendErrorReact = async () => {
    return await sendReact("❌");
  };

  const sendSuccessReply = async (text, mentions) => {
    await sendSuccessReact();
    return await sendReply(`✅ ${text}`, mentions);
  };

  const sendWaitReply = async (text, mentions) => {
    await sendWaitReact();
    return await sendReply(
      `⏳ Aguarde! ${text || "Carregando dados..."}`,
      mentions
    );
  };

  const sendWarningReply = async (text, mentions) => {
    await sendWarningReact();
    return await sendReply(`⚠️ Atenção! ${text}`, mentions);
  };

  const sendErrorReply = async (text, mentions) => {
    await sendErrorReact();
    return await sendReply(`❌ Erro! ${text}`, mentions);
  };

  const sendStickerFromFile = async (file, quoted = true) => {
    const quotedObject = quoted ? { quoted: webMessage } : {};
    return await socket.sendMessage(
      remoteJid,
      {
        sticker: fs.readFileSync(file),
      },
      {
        ...quotedObject,
      }
    );
  };

  const sendStickerFromURL = async (url, quoted = true) => {
    const quotedObject = quoted ? { quoted: webMessage } : {};
    console.log({
      remoteJid,
      data: {
        sticker: { url },
      },
      add: { url, ...quotedObject },
    });
    return await socket.sendMessage(
      remoteJid,
      {
        sticker: { url },
      },
      { url, ...quotedObject }
    );
  };

  const sendImageFromFile = async (
    file,
    caption = "",
    mentions = null,
    quoted = true
  ) => {
    const quotedObject = quoted ? { quoted: webMessage } : {};

    let optionalParams = {};

    if (mentions?.length) {
      optionalParams = { mentions };
    }

    return await withRetry(async () => {
      return await socket.sendMessage(
        remoteJid,
        {
          image: fs.readFileSync(file),
          caption: caption ? `${BOT_EMOJI} ${caption}` : "",
          ...optionalParams,
        },
        {
          ...quotedObject,
        }
      );
    });
  };

  const sendImageFromURL = async (
    url,
    caption = "",
    mentions = null,
    quoted = true
  ) => {
    const quotedObject = quoted ? { quoted: webMessage } : {};

    let optionalParams = {};

    if (mentions?.length) {
      optionalParams = { mentions };
    }

    return await withRetry(async () => {
      return await socket.sendMessage(
        remoteJid,
        {
          image: { url },
          caption: caption ? `${BOT_EMOJI} ${caption}` : "",
          ...optionalParams,
        },
        { url, ...quotedObject }
      );
    });
  };

  const sendImageFromBuffer = async (
    buffer,
    caption = "",
    mentions = null,
    quoted = true
  ) => {
    const quotedObject = quoted ? { quoted: webMessage } : {};

    let optionalParams = {};

    if (mentions?.length) {
      optionalParams = { mentions };
    }

    return await withRetry(async () => {
      return await socket.sendMessage(
        remoteJid,
        {
          image: buffer,
          caption: caption ? `${BOT_EMOJI} ${caption}` : "",
          ...optionalParams,
        },
        {
          ...quotedObject,
        }
      );
    });
  };

  const sendVideoFromFile = async (
    file,
    caption = "",
    mentions = null,
    quoted = true
  ) => {
    const quotedObject = quoted ? { quoted: webMessage } : {};

    let optionalParams = {};

    if (mentions?.length) {
      optionalParams = { mentions };
    }

    return await socket.sendMessage(
      remoteJid,
      {
        video: fs.readFileSync(file),
        caption: caption ? `${BOT_EMOJI} ${caption}` : "",
        ...optionalParams,
      },
      {
        ...quotedObject,
      }
    );
  };

  const sendAudioFromFile = async (
    filePath,
    asVoice = false,
    quoted = true
  ) => {
    const quotedObject = quoted ? { quoted: webMessage } : {};

    const audioBuffer = fs.readFileSync(filePath);

    const {
      audioPath,
      audioBuffer: processedBuffer,
      oldAudioPath,
    } = await ajustAudioByBuffer(audioBuffer, asVoice);

    const mimetype = asVoice ? "audio/ogg; codecs=opus" : "audio/mpeg";

    if (asVoice) {
      await sendRecordState();
    }

    removeFileWithTimeout(audioPath);
    removeFileWithTimeout(oldAudioPath);

    return await socket.sendMessage(
      remoteJid,
      {
        audio: processedBuffer,
        mimetype,
        ptt: asVoice,
      },
      {
        ...quotedObject,
      }
    );
  };

  const sendAudioFromBuffer = async (
    buffer,
    asVoice = false,
    quoted = true
  ) => {
    const quotedObject = quoted ? { quoted: webMessage } : {};

    const {
      audioPath,
      audioBuffer: processedBuffer,
      oldAudioPath,
    } = await ajustAudioByBuffer(buffer, asVoice);

    const mimetype = asVoice ? "audio/ogg; codecs=opus" : "audio/mpeg";

    if (asVoice) {
      await sendRecordState();
    }

    removeFileWithTimeout(audioPath);
    removeFileWithTimeout(oldAudioPath);

    return await socket.sendMessage(
      remoteJid,
      {
        audio: processedBuffer,
        mimetype,
        ptt: asVoice,
      },
      {
        ...quotedObject,
      }
    );
  };

  const sendAudioFromURL = async (url, asVoice = false, quoted = true) => {
    const quotedObject = quoted ? { quoted: webMessage } : {};

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch audio from URL: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    const {
      audioPath,
      audioBuffer: processedBuffer,
      oldAudioPath,
    } = await ajustAudioByBuffer(audioBuffer, asVoice);

    const mimetype = asVoice ? "audio/ogg; codecs=opus" : "audio/mpeg";

    if (asVoice) {
      await sendRecordState();
    }

    removeFileWithTimeout(audioPath);
    removeFileWithTimeout(oldAudioPath);

    return await socket.sendMessage(
      remoteJid,
      {
        audio: processedBuffer,
        mimetype,
        ptt: asVoice,
      },
      {
        ...quotedObject,
      }
    );
  };

  const sendVideoFromURL = async (
    url,
    caption = "",
    mentions = null,
    quoted = true
  ) => {
    const quotedObject = quoted ? { quoted: webMessage } : {};

    let optionalParams = {};

    if (mentions?.length) {
      optionalParams = { mentions };
    }

    return await socket.sendMessage(
      remoteJid,
      {
        video: { url },
        caption: caption ? `${BOT_EMOJI} ${caption}` : "",
        ...optionalParams,
      },
      { url, ...quotedObject }
    );
  };

  const sendGifFromFile = async (
    file,
    caption = "",
    mentions = null,
    quoted = true
  ) => {
    const quotedObject = quoted ? { quoted: webMessage } : {};
    let optionalParams = {};

    if (mentions?.length) {
      optionalParams = { mentions };
    }

    return await socket.sendMessage(
      remoteJid,
      {
        video: fs.readFileSync(file),
        caption: caption ? `${BOT_EMOJI} ${caption}` : "",
        gifPlayback: true,
        ...optionalParams,
      },
      {
        ...quotedObject,
      }
    );
  };

  const sendGifFromURL = async (
    url,
    caption = "",
    mentions = null,
    quoted = true
  ) => {
    const quotedObject = quoted ? { quoted: webMessage } : {};
    let optionalParams = {};

    if (mentions?.length) {
      optionalParams = { mentions };
    }

    return await socket.sendMessage(
      remoteJid,
      {
        video: { url },
        caption: caption ? `${BOT_EMOJI} ${caption}` : "",
        gifPlayback: true,
        ...optionalParams,
      },
      { url, ...quotedObject }
    );
  };

  const sendGifFromBuffer = async (
    buffer,
    caption = "",
    mentions = null,
    quoted = true
  ) => {
    const quotedObject = quoted ? { quoted: webMessage } : {};
    let optionalParams = {};

    if (mentions?.length) {
      optionalParams = { mentions };
    }

    return await socket.sendMessage(
      remoteJid,
      {
        video: buffer,
        caption: caption ? `${BOT_EMOJI} ${caption}` : "",
        gifPlayback: true,
        ...optionalParams,
      },
      {
        ...quotedObject,
      }
    );
  };

  const sendDocumentFromFile = async (
    file,
    mimetype,
    fileName,
    quoted = true
  ) => {
    const quotedObject = quoted ? { quoted: webMessage } : {};
    return await socket.sendMessage(
      remoteJid,
      {
        document: fs.readFileSync(file),
        mimetype: mimetype || "application/octet-stream",
        fileName: fileName || "documento.pdf",
      },
      {
        ...quotedObject,
      }
    );
  };

  const sendDocumentFromURL = async (
    url,
    mimetype,
    fileName,
    quoted = true
  ) => {
    const quotedObject = quoted ? { quoted: webMessage } : {};
    return await socket.sendMessage(
      remoteJid,
      {
        document: { url },
        mimetype: mimetype || "application/octet-stream",
        fileName: fileName || "documento.pdf",
      },
      { url, ...quotedObject }
    );
  };

  const sendDocumentFromBuffer = async (
    buffer,
    mimetype,
    fileName,
    quoted = true
  ) => {
    const quotedObject = quoted ? { quoted: webMessage } : {};
    return await socket.sendMessage(
      remoteJid,
      {
        document: buffer,
        mimetype: mimetype || "application/octet-stream",
        fileName: fileName || "documento.pdf",
      },
      {
        ...quotedObject,
      }
    );
  };

  const sendVideoFromBuffer = async (
    buffer,
    caption = "",
    mentions = null,
    quoted = true
  ) => {
    const quotedObject = quoted ? { quoted: webMessage } : {};

    let optionalParams = {};

    if (mentions?.length) {
      optionalParams = { mentions };
    }

    return await socket.sendMessage(
      remoteJid,
      {
        video: buffer,
        caption: caption ? `${BOT_EMOJI} ${caption}` : "",
        ...optionalParams,
      },
      {
        ...quotedObject,
      }
    );
  };

  const sendStickerFromBuffer = async (buffer, quoted = true) => {
    const quotedObject = quoted ? { quoted: webMessage } : {};
    return await socket.sendMessage(
      remoteJid,
      {
        sticker: buffer,
      },
      {
        ...quotedObject,
      }
    );
  };

  const sendPoll = async (title, options, singleChoice = false) => {
    return await socket.sendMessage(remoteJid, {
      poll: {
        name: `${BOT_EMOJI} ${title}`,
        selectableCount: singleChoice ? 1 : 0,
        toAnnouncementGroup: true,
        values: options.map((option) => option.optionName),
      },
    });
  };

  const isGroup = !!remoteJid?.endsWith("@g.us");
  const isGroupWithLid = !!userJid?.endsWith("@lid");

  const deleteMessage = async (key) => {
    const { id, remoteJid, participant } = key;

    const deleteKey = {
      remoteJid,
      fromMe: false,
      id,
      participant,
    };

    await socket.sendMessage(remoteJid, { delete: deleteKey });
  };

  const getGroupMetadata = async (groupJid = remoteJid) => {
    if (!groupJid.endsWith("@g.us")) {
      return null;
    }

    return await socket.groupMetadata(groupJid);
  };

  const getGroupName = async (groupJid = remoteJid) => {
    if (!groupJid.endsWith("@g.us")) {
      return null;
    }

    const metadata = await getGroupMetadata(groupJid);
    return metadata?.subject || "";
  };

  const getGroupOwner = async (groupJid = remoteJid) => {
    if (!groupJid.endsWith("@g.us")) {
      return null;
    }

    const metadata = await getGroupMetadata(groupJid);
    return metadata?.owner || "";
  };

  const getGroupParticipants = async (groupJid = remoteJid) => {
    if (!groupJid.endsWith("@g.us")) {
      return [];
    }

    const metadata = await getGroupMetadata(groupJid);
    return metadata?.participants || [];
  };

  const getGroupAdmins = async (groupJid = remoteJid) => {
    if (!groupJid.endsWith("@g.us")) {
      return [];
    }

    const participants = await getGroupParticipants(groupJid);
    return participants
      .filter((p) => p.admin === "admin" || p.admin === "superadmin")
      .map((p) => p.id);
  };

  return {
    args,
    commandName,
    fullArgs,
    fullMessage,
    isGroup,
    isGroupWithLid,
    isAudio,
    isImage,
    isReply,
    isSticker,
    isVideo,
    prefix,
    remoteJid,
    replyJid,
    socket,
    userJid,
    replyText,
    webMessage,
    deleteMessage,
    downloadAudio,
    downloadImage,
    downloadSticker,
    downloadVideo,
    getGroupAdmins,
    getGroupMetadata,
    getGroupName,
    getGroupOwner,
    getGroupParticipants,
    sendAudioFromBuffer,
    sendAudioFromFile,
    sendAudioFromURL,
    sendContact,
    sendDocumentFromBuffer,
    sendDocumentFromFile,
    sendDocumentFromURL,
    sendEditedReply,
    sendEditedText,
    sendErrorReact,
    sendErrorReply,
    sendGifFromBuffer,
    sendGifFromFile,
    sendGifFromURL,
    sendImageFromBuffer,
    sendImageFromFile,
    sendImageFromURL,
    sendLocation,
    sendPoll,
    sendReact,
    sendRecordState,
    sendReply,
    sendStickerFromBuffer,
    sendStickerFromFile,
    sendStickerFromURL,
    sendSuccessReact,
    sendSuccessReply,
    sendText,
    sendTypingState,
    sendVideoFromBuffer,
    sendVideoFromFile,
    sendVideoFromURL,
    sendWaitReact,
    sendWaitReply,
    sendWarningReact,
    sendWarningReply,
  };
};
