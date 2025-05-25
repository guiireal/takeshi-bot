/**
 * Funções comuns de uso geral
 * do bot. Não há
 * necessidade de modificar
 * este arquivo.
 *
 * @author Dev Gui
 */
const { BOT_EMOJI } = require("../config");
const { extractDataFromMessage, baileysIs, download } = require(".");
const { waitMessage } = require("./messages");
const fs = require("node:fs");

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
  } = extractDataFromMessage(webMessage);

  if (!remoteJid) {
    return null;
  }

  const isImage = baileysIs(webMessage, "image");
  const isVideo = baileysIs(webMessage, "video");
  const isSticker = baileysIs(webMessage, "sticker");

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
    let optionalParams = {};

    if (mentions?.length) {
      optionalParams = { mentions };
    }

    return await socket.sendMessage(remoteJid, {
      text: `${BOT_EMOJI} ${text}`,
      ...optionalParams,
    });
  };

  const sendReply = async (text) => {
    return await socket.sendMessage(
      remoteJid,
      { text: `${BOT_EMOJI} ${text}` },
      { quoted: webMessage }
    );
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

  const sendSuccessReply = async (text) => {
    await sendSuccessReact();
    return await sendReply(`✅ ${text}`);
  };

  const sendWaitReply = async (text) => {
    await sendWaitReact();
    return await sendReply(`⏳ Aguarde! ${text || waitMessage}`);
  };

  const sendWarningReply = async (text) => {
    await sendWarningReact();
    return await sendReply(`⚠️ Atenção! ${text}`);
  };

  const sendErrorReply = async (text) => {
    await sendErrorReact();
    return await sendReply(`❌ Erro! ${text}`);
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

    return await socket.sendMessage(
      remoteJid,
      {
        image: { url },
        caption: caption ? `${BOT_EMOJI} ${caption}` : "",
        ...optionalParams,
      },
      { url, ...quotedObject }
    );
  };

  const sendAudioFromFile = async (
    filePath,
    asVoice = false,
    quoted = true
  ) => {
    const quotedObject = quoted ? { quoted: webMessage } : {};
    return await socket.sendMessage(
      remoteJid,
      {
        audio: fs.readFileSync(filePath),
        mimetype: "audio/mp4",
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
    return await socket.sendMessage(
      remoteJid,
      {
        audio: buffer,
        mimetype: "audio/mp4",
        ptt: asVoice,
      },
      {
        ...quotedObject,
      }
    );
  };

  const sendAudioFromURL = async (url, asVoice = false, quoted = true) => {
    const quotedObject = quoted ? { quoted: webMessage } : {};
    return await socket.sendMessage(
      remoteJid,
      {
        audio: { url },
        mimetype: "audio/mp4",
        ptt: asVoice,
      },
      { url, ...quotedObject }
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
    isImage,
    isReply,
    isSticker,
    isVideo,
    prefix,
    remoteJid,
    replyJid,
    socket,
    userJid,
    webMessage,
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
    sendDocumentFromBuffer,
    sendDocumentFromFile,
    sendDocumentFromURL,
    sendErrorReact,
    sendErrorReply,
    sendGifFromBuffer,
    sendGifFromFile,
    sendGifFromURL,
    sendImageFromBuffer,
    sendImageFromFile,
    sendImageFromURL,
    sendReact,
    sendReply,
    sendPoll,
    sendStickerFromBuffer,
    sendStickerFromFile,
    sendStickerFromURL,
    sendSuccessReact,
    sendSuccessReply,
    sendText,
    sendVideoFromBuffer,
    sendVideoFromFile,
    sendVideoFromURL,
    sendWaitReact,
    sendWaitReply,
    sendWarningReact,
    sendWarningReply,
  };
};
