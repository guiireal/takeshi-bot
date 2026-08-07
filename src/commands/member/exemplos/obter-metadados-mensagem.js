import { delay } from "zapo-js";
import { PREFIX } from "../../../config.js";
import { onlyNumbers } from "../../../utils/index.js";

export default {
  name: "obter-metadados-mensagem",
  description:
    "Exemplo avançado de como obter informações detalhadas da mensagem atual ou mensagem citada, incluindo análise de mídia, menções e metadados técnicos",
  commands: ["obter-metadados-mensagem", "metadados", "info-msg"],
  usage: `${PREFIX}obter-metadados-mensagem [responda uma mensagem para obter seus metadados detalhados]`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    sendReply,
    sendReact,
    sendText,
    webMessage,
    userLid,
    remoteJid,
    isGroup,
    isImage,
    isVideo,
    isSticker,
    isReply,
    fullMessage,
    commandName,
    args,
    fullArgs,
    prefix,
    replyLid,
    getGroupMetadata,
  }) => {
    await sendReply(JSON.stringify(webMessage, null, 2));

    await delay(2000);

    await sendReact("📊");

    await delay(2000);

    await sendReply("🔍 Obtendo metadados da mensagem...");

    let targetMessage = webMessage;
    let isAnalyzingReply = false;

    if (
      isReply &&
      webMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage
    ) {
      targetMessage = {
        ...webMessage,
        message:
          webMessage.message.extendedTextMessage.contextInfo.quotedMessage,
        key: {
          ...webMessage.key,
          participant:
            webMessage.message.extendedTextMessage.contextInfo.participant ||
            replyLid,
          id: webMessage.message.extendedTextMessage.contextInfo.stanzaId,
        },
        timestampSeconds:
          webMessage.message.extendedTextMessage.contextInfo.quotedMessage
            .timestampSeconds || webMessage.timestampSeconds,
        pushName:
          webMessage.message.extendedTextMessage.contextInfo.pushName ||
          "Usuário",
      };
      isAnalyzingReply = true;
    }

    const analysisType = isAnalyzingReply
      ? "mensagem citada"
      : "mensagem atual";
    await sendReply(`🔍 Analisando metadados da *${analysisType}*:`);

    await delay(2000);

    const targetUserLid = isAnalyzingReply ? replyLid : userLid;
    const targetUserNumber = onlyNumbers(targetUserLid);

    const messageText = isAnalyzingReply
      ? getMessageText(targetMessage)
      : fullMessage;
    const messageType = getAdvancedMessageType(
      targetMessage,
      isAnalyzingReply,
      {
        isImage: isAnalyzingReply
          ? getMediaType(targetMessage) && targetMessage.message.imageMessage
          : isImage,
        isVideo: isAnalyzingReply
          ? getMediaType(targetMessage) && targetMessage.message.videoMessage
          : isVideo,
        isSticker: isAnalyzingReply
          ? getMediaType(targetMessage) && targetMessage.message.stickerMessage
          : isSticker,
      }
    );
    const mediaInfo = getEnhancedMediaInfo(targetMessage, isAnalyzingReply);
    const messageFlags = getMessageFlags(targetMessage, isAnalyzingReply, {
      isImage: isAnalyzingReply
        ? getMediaType(targetMessage) && targetMessage.message.imageMessage
        : isImage,
      isVideo: isAnalyzingReply
        ? getMediaType(targetMessage) && targetMessage.message.videoMessage
        : isVideo,
      isSticker: isAnalyzingReply
        ? getMediaType(targetMessage) && targetMessage.message.stickerMessage
        : isSticker,
    });

    const basicInfo = `📋 *Informações da ${
      analysisType.charAt(0).toUpperCase() + analysisType.slice(1)
    }:*

🆔 *Identificação:*
• Usuário: @${targetUserNumber}
• LID: \`${targetUserLid}\`
• Chat: \`${remoteJid}\`
• ID da mensagem: \`${targetMessage.key?.id || "N/A"}\`
• Timestamp: ${new Date(
      (targetMessage.timestampSeconds || 0) * 1000
    ).toLocaleString("pt-BR")}

📱 *Contexto:*
• É grupo: ${isGroup ? "Sim" : "Não"}
• Tipo de mensagem: ${messageType}
• Nome do remetente: ${targetMessage.pushName || "N/A"}
• Enviada pelo bot: ${targetMessage.key?.fromMe ? "Sim" : "Não"}
• É broadcast: ${targetMessage.broadcast ? "Sim" : "Não"}

🏷️ *Flags de Mídia:*
${messageFlags}`;

    await sendText(basicInfo, [targetUserLid]);

    await delay(3000);

    const contentInfo = `💬 *Conteúdo da Mensagem:*

📝 *Texto:*
${messageText ? `"${messageText}"` : "Sem texto"}

🎯 *Detalhes do Tipo:*
${mediaInfo}

⚡ *Dados do Comando Atual:*
• Nome: ${commandName}
• Prefixo: ${prefix}
• Argumentos: ${args.length > 0 ? args.join(", ") : "Nenhum"}
• Args completos: ${fullArgs || "Nenhum"}
• É resposta: ${isReply ? "Sim" : "Não"}`;

    await sendReply(contentInfo);

    await delay(3000);

    if (isGroup) {
      try {
        const groupMetadata = await getGroupMetadata();
        const participant = groupMetadata?.participants?.find(
          (p) => p.id === targetUserLid
        );

        const groupInfo = `👥 *Informações do Grupo:*

📊 *Participante:*
• Status: ${participant?.admin ? `Admin (${participant.admin})` : "Membro"}
• Nome do grupo: ${groupMetadata?.subject || "N/A"}
• Total de participantes: ${groupMetadata?.participants?.length || 0}

🔧 *Configurações:*
• Apenas admins: ${groupMetadata?.announce ? "Sim" : "Não"}
• Aprovação para entrar: ${groupMetadata?.restrict ? "Sim" : "Não"}`;

        await sendReply(groupInfo);
        await delay(3000);
      } catch (error) {
        console.error("Erro ao obter metadados do grupo:", error);
      }
    }

    if (isReply) {
      const quotedMentions =
        webMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage
          ?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      const replyInfo = `🔗 *Informações de Resposta:*

📎 *Contexto:*
• Respondendo para: @${onlyNumbers(replyLid)}
• ID da mensagem original: \`${
        webMessage.message?.extendedTextMessage?.contextInfo?.stanzaId || "N/A"
      }\`
• Analisando: ${
        isAnalyzingReply ? "Mensagem citada" : "Sua mensagem de comando"
      }
• Menções na mensagem citada: ${
        quotedMentions.length > 0
          ? `${quotedMentions.length} usuário(s)`
          : "Nenhuma"
      }

🔍 *Análise Detalhada:*
• Tipo da mensagem citada: ${getMessageType(targetMessage)}
• Tem mídia: ${getMediaType(targetMessage) ? "Sim" : "Não"}
• Data da mensagem citada: ${new Date(
        (targetMessage.timestampSeconds || 0) * 1000
      ).toLocaleString("pt-BR")}`;

      await sendText(replyInfo, [replyLid]);
      await delay(3000);
    }

    await delay(3000);

    await sendReply(
      `💡 *Dicas de Uso:*

🎯 *Para desenvolvedores:*
• Use \`isReply\` para detectar respostas
• \`replyLid\` contém o JID do usuário citado
• \`webMessage.message.extendedTextMessage.contextInfo\` tem dados da mensagem citada
• \`getGroupMetadata()\` fornece informações detalhadas do grupo

🔄 *Experimente:*
• Responda uma mensagem com este comando
• Use em diferentes tipos de mídia
• Teste em grupos e conversas privadas`
    );
  },
};

function getMessageText(message) {
  const msg = message.message;
  if (!msg) return null;

  return (
    msg.conversation ||
    msg.extendedTextMessage?.text ||
    msg.imageMessage?.caption ||
    msg.videoMessage?.caption ||
    msg.documentMessage?.caption ||
    msg.audioMessage?.caption ||
    null
  );
}

function getAdvancedMessageType(message, isAnalyzingReply, systemFlags = {}) {
  const msg = message.message;
  if (!msg) return "Desconhecido";

  const basicType = getMessageType(message);

  let typeDetails = basicType;

  if (msg.extendedTextMessage?.contextInfo?.quotedMessage) {
    typeDetails += " (com citação)";
  }

  if (msg.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
    typeDetails += " (com menções)";
  }

  if (
    systemFlags.isImage ||
    msg.imageMessage?.isGif ||
    msg.videoMessage?.gifPlayback
  ) {
    if (msg.imageMessage?.isGif || msg.videoMessage?.gifPlayback) {
      typeDetails += " (GIF)";
    }
  }

  if (msg.audioMessage?.ptt) {
    typeDetails = "Áudio (nota de voz)";
  }

  const flags = [];
  if (systemFlags.isImage && !isAnalyzingReply) flags.push("📸");
  if (systemFlags.isVideo && !isAnalyzingReply) flags.push("🎥");
  if (systemFlags.isSticker && !isAnalyzingReply) flags.push("🏷️");

  if (flags.length > 0) {
    typeDetails += ` ${flags.join("")}`;
  }

  return typeDetails;
}

function getEnhancedMediaInfo(message) {
  const msg = message.message;
  if (!msg) return "Sem mídia";

  if (msg.imageMessage) {
    const isGif = msg.imageMessage.isGif ? " (GIF)" : "";
    return `📸 Imagem${isGif}
• Tamanho: ${formatFileSize(msg.imageMessage.fileLength)}
• Dimensões: ${msg.imageMessage.width || "N/A"}x${
      msg.imageMessage.height || "N/A"
    }
• Mimetype: ${msg.imageMessage.mimetype || "N/A"}
• SHA256: ${msg.imageMessage.fileSha256 ? "✅" : "❌"}
• Legenda: ${msg.imageMessage.caption || "Sem legenda"}`;
  }

  if (msg.videoMessage) {
    const isGif = msg.videoMessage.gifPlayback ? " (GIF)" : "";
    return `🎥 Vídeo${isGif}
• Tamanho: ${formatFileSize(msg.videoMessage.fileLength)}
• Duração: ${msg.videoMessage.seconds || "N/A"}s
• Dimensões: ${msg.videoMessage.width || "N/A"}x${
      msg.videoMessage.height || "N/A"
    }
• Mimetype: ${msg.videoMessage.mimetype || "N/A"}
• SHA256: ${msg.videoMessage.fileSha256 ? "✅" : "❌"}
• Legenda: ${msg.videoMessage.caption || "Sem legenda"}`;
  }

  if (msg.audioMessage) {
    const isPtt = msg.audioMessage.ptt ? " (Nota de voz)" : "";
    return `🔊 Áudio${isPtt}
• Tamanho: ${formatFileSize(msg.audioMessage.fileLength)}
• Duração: ${msg.audioMessage.seconds || "N/A"}s
• Mimetype: ${msg.audioMessage.mimetype || "N/A"}
• SHA256: ${msg.audioMessage.fileSha256 ? "✅" : "❌"}
• Waveform: ${msg.audioMessage.waveform ? "✅" : "❌"}`;
  }

  if (msg.documentMessage) {
    return `📄 Documento
• Nome: ${msg.documentMessage.fileName || "N/A"}
• Tamanho: ${formatFileSize(msg.documentMessage.fileLength)}
• Mimetype: ${msg.documentMessage.mimetype || "N/A"}
• SHA256: ${msg.documentMessage.fileSha256 ? "✅" : "❌"}
• Páginas: ${msg.documentMessage.pageCount || "N/A"}`;
  }

  if (msg.stickerMessage) {
    const isAnimated = msg.stickerMessage.isAnimated ? " (Animado)" : "";
    return `🏷️ Sticker${isAnimated}
• Tamanho: ${formatFileSize(msg.stickerMessage.fileLength)}
• Dimensões: ${msg.stickerMessage.width || "N/A"}x${
      msg.stickerMessage.height || "N/A"
    }
• Mimetype: ${msg.stickerMessage.mimetype || "N/A"}
• SHA256: ${msg.stickerMessage.fileSha256 ? "✅" : "❌"}`;
  }

  if (msg.contactMessage) {
    return `👤 Contato
• Nome: ${msg.contactMessage.displayName || "N/A"}
• VCard: ${msg.contactMessage.vcard ? "✅" : "❌"}`;
  }

  if (msg.locationMessage) {
    return `📍 Localização
• Latitude: ${msg.locationMessage.degreesLatitude || "N/A"}
• Longitude: ${msg.locationMessage.degreesLongitude || "N/A"}
• Nome: ${msg.locationMessage.name || "N/A"}
• Endereço: ${msg.locationMessage.address || "N/A"}`;
  }

  return "Texto sem mídia";
}

function getMessageFlags(message) {
  const msg = message.message;
  if (!msg) return "Nenhuma flag detectada";

  const flags = [];

  if (msg.imageMessage) flags.push("📸 Imagem");
  if (msg.videoMessage) flags.push("🎥 Vídeo");
  if (msg.audioMessage) flags.push("🔊 Áudio");
  if (msg.documentMessage) flags.push("📄 Documento");
  if (msg.stickerMessage) flags.push("🏷️ Sticker");
  if (msg.contactMessage) flags.push("👤 Contato");
  if (msg.locationMessage) flags.push("📍 Localização");

  if (msg.imageMessage?.isGif || msg.videoMessage?.gifPlayback)
    flags.push("🎭 GIF");
  if (msg.audioMessage?.ptt) flags.push("🎤 Nota de voz");
  if (msg.stickerMessage?.isAnimated) flags.push("✨ Sticker animado");

  if (msg.extendedTextMessage?.contextInfo?.quotedMessage)
    flags.push("💬 Com citação");
  if (msg.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
    flags.push(
      `👥 ${msg.extendedTextMessage.contextInfo.mentionedJid.length} menção(ões)`
    );
  }

  if (message.key?.fromMe) flags.push("🤖 Enviada pelo bot");
  if (message.broadcast) flags.push("📡 Broadcast");

  return flags.length > 0 ? flags.join("\n• ") : "Nenhuma flag especial";
}

function formatFileSize(bytes) {
  if (!bytes) return "N/A";

  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
}

function getMessageType(message) {
  const msg = message.message;
  if (!msg) return "Desconhecido";

  if (msg.conversation) return "Texto simples";
  if (msg.extendedTextMessage) return "Texto estendido";
  if (msg.imageMessage) return "Imagem";
  if (msg.videoMessage) return "Vídeo";
  if (msg.audioMessage) return "Áudio";
  if (msg.documentMessage) return "Documento";
  if (msg.stickerMessage) return "Sticker";
  if (msg.locationMessage) return "Localização";
  if (msg.contactMessage) return "Contato";

  return Object.keys(msg)[0] || "Desconhecido";
}

function getMediaType(message) {
  const msg = message.message;
  if (!msg) return false;

  return !!(
    msg.imageMessage ||
    msg.videoMessage ||
    msg.audioMessage ||
    msg.documentMessage ||
    msg.stickerMessage
  );
}
