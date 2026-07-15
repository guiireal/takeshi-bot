import { generateWAMessageFromContent, proto } from "baileys";
import { randomBytes } from "node:crypto";

const META_AI_BOT_JID = "867051314767696@bot";
const META_AI_BOT_NAME = "Meta AI";
const META_AI_CREATOR_NAME = "Meta";
const FORWARD_ORIGIN_META_AI = 4;
const BOT_ENTRY_POINT_INVOKE_META_AI_1ON1 = 29;
const BOT_ENTRY_POINT_INVOKE_META_AI_GROUP = 30;

const KEYWORD_HIGHLIGHT = 1;
const STRING_HIGHLIGHT = 3;
const NUMBER_HIGHLIGHT = 4;

const CODE_TOKEN_REGEX =
  /\b(?:async|await|break|case|catch|class|const|continue|default|do|else|export|for|from|function|if|import|in|let|new|null|return|switch|this|throw|true|false|try|undefined|var|while)\b|\b\d+(?:\.\d+)?\b|(["'`])(?:\\.|(?!\1)[\s\S])*\1/g;

export function makeTextSubmessage(messageText) {
  return {
    messageType: 2,
    messageText: String(messageText || ""),
  };
}

export function makeCodeSubmessage(codeLanguage, codeTextOrBlocks) {
  const codeBlocks = Array.isArray(codeTextOrBlocks)
    ? codeTextOrBlocks
    : buildCodeBlocksFromString(codeTextOrBlocks);

  return {
    messageType: 5,
    codeMetadata: {
      codeLanguage,
      codeBlocks,
    },
  };
}

export function buildCodeBlocksFromString(codeText) {
  const text = String(codeText || "");
  const blocks = [];
  let lastIndex = 0;

  for (const match of text.matchAll(CODE_TOKEN_REGEX)) {
    const token = match[0];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      blocks.push({ codeContent: text.slice(lastIndex, index) });
    }

    blocks.push({
      highlightType: getHighlightType(token),
      codeContent: token,
    });

    lastIndex = index + token.length;
  }

  if (lastIndex < text.length) {
    blocks.push({ codeContent: text.slice(lastIndex) });
  }

  return blocks.length ? blocks : [{ codeContent: text }];
}

export function buildRichCodeResponse({
  title,
  language = "javascript",
  code,
  footer,
  prefix = "takeshi-code",
}) {
  const submessages = [
    title ? makeTextSubmessage(title) : null,
    makeCodeSubmessage(language, code),
    footer ? makeTextSubmessage(footer) : null,
  ].filter(Boolean);

  return buildRichResponse(submessages, prefix);
}

export async function sendRichCodeMessage(
  socket,
  remoteJid,
  { title, language = "javascript", code, footer, quoted, prefix },
) {
  const richResponse = buildRichCodeResponse({
    title,
    language,
    code,
    footer,
    prefix,
  });

  return sendRichResponseMessage(socket, remoteJid, richResponse, quoted);
}

export function buildRichResponse(submessages, prefix = "takeshi-code") {
  return {
    messageType: 1,
    submessages,
    unifiedResponse: {
      data: encodeUnifiedResponseData({
        response_id: buildResponseId(prefix),
        sections: submessages.map(buildUnifiedSection).filter(Boolean),
      }),
    },
  };
}

export function buildRichMarkdownResponse(message, prefix = "takeshi-code") {
  const text = String(message || "");
  const codeFenceRegex = /```([^\r\n`]*)\r?\n([\s\S]*?)```/g;
  const submessages = [];
  let lastIndex = 0;
  let hasCode = false;

  for (const match of text.matchAll(codeFenceRegex)) {
    const matchIndex = match.index ?? 0;
    const prose = text.slice(lastIndex, matchIndex).trim();
    const code = match[2].replace(/\r?\n$/, "");
    const language = match[1].trim().split(/\s+/)[0] || "text";

    if (prose) {
      submessages.push(makeTextSubmessage(prose));
    }

    submessages.push(makeCodeSubmessage(language, code));
    hasCode = true;
    lastIndex = matchIndex + match[0].length;
  }

  if (!hasCode) {
    return null;
  }

  const trailingProse = text.slice(lastIndex).trim();

  if (trailingProse) {
    submessages.push(makeTextSubmessage(trailingProse));
  }

  return buildRichResponse(submessages, prefix);
}

export async function sendRichResponseMessage(
  socket,
  remoteJid,
  richResponse,
  quoted,
) {
  const rich = applyForwardedMetaAiContext(richResponse, remoteJid);
  const payload = proto.Message.fromObject({
    botForwardedMessage: {
      message: {
        richResponseMessage: rich,
      },
    },
    messageContextInfo: {
      messageSecret: randomBytes(32),
      botMetadata: buildBotMetadata(["RICH_RESPONSE_CODE"]),
    },
  });
  const waMessage = generateWAMessageFromContent(remoteJid, payload, {
    quoted: quoted ? JSON.parse(JSON.stringify(quoted)) : undefined,
  });

  return socket.relayMessage(remoteJid, waMessage.message, {
    messageId: waMessage.key.id,
  });
}

function getHighlightType(token) {
  if (/^["'`]/.test(token)) {
    return STRING_HIGHLIGHT;
  }

  if (/^\d/.test(token)) {
    return NUMBER_HIGHLIGHT;
  }

  return KEYWORD_HIGHLIGHT;
}

function buildUnifiedSection(submessage) {
  if (submessage.messageType === 2) {
    return {
      view_model: {
        primitive: {
          text: submessage.messageText,
          __typename: "GenAIMarkdownTextUXPrimitive",
        },
        __typename: "GenAISingleLayoutViewModel",
      },
    };
  }

  if (submessage.messageType === 5) {
    return {
      view_model: {
        primitive: {
          language: submessage.codeMetadata.codeLanguage,
          code_blocks: submessage.codeMetadata.codeBlocks.map((block) => ({
            content: String(block.codeContent || ""),
            type: mapHighlightTypeToUnified(block.highlightType),
          })),
          __typename: "GenAICodeUXPrimitive",
        },
        __typename: "GenAISingleLayoutViewModel",
      },
    };
  }

  return null;
}

function mapHighlightTypeToUnified(highlightType) {
  switch (highlightType) {
    case KEYWORD_HIGHLIGHT:
      return "KEYWORD";
    case STRING_HIGHLIGHT:
      return "STR";
    case NUMBER_HIGHLIGHT:
      return "NUMBER";
    default:
      return "DEFAULT";
  }
}

function buildBotMetadata(extraCapabilities = []) {
  return {
    modelMetadata: {
      modelType: "LLAMA_PROD",
      premiumModelStatus: "AVAILABLE",
    },
    botAgeCollectionMetadata: {},
    botResponseId: buildResponseId("takeshi-code"),
    verificationMetadata: {
      proofs: [],
    },
    botInfrastructureDiagnostics: {},
    capabilityMetadata: {
      capabilities: [
        "RICH_RESPONSE_STRUCTURED_RESPONSE",
        "RICH_RESPONSE_UNIFIED_RESPONSE",
        "RICH_RESPONSE_UNIFIED_TEXT_COMPONENT",
        "SESSION_TRANSPARENCY_SYSTEM_MESSAGE",
        ...extraCapabilities,
      ],
    },
  };
}

function applyForwardedMetaAiContext(richResponse, remoteJid) {
  return {
    ...richResponse,
    contextInfo: {
      isForwarded: true,
      forwardingScore: 1,
      forwardOrigin: FORWARD_ORIGIN_META_AI,
      forwardedAiBotMessageInfo: {
        botName: META_AI_BOT_NAME,
        botJid: META_AI_BOT_JID,
        creatorName: META_AI_CREATOR_NAME,
      },
      botMessageSharingInfo: {
        botEntryPointOrigin: String(remoteJid || "").endsWith("@g.us")
          ? BOT_ENTRY_POINT_INVOKE_META_AI_GROUP
          : BOT_ENTRY_POINT_INVOKE_META_AI_1ON1,
        forwardScore: 1,
      },
    },
  };
}

function buildResponseId(prefix) {
  return `${prefix}-${Date.now()}-${randomBytes(6).toString("hex")}`;
}

function encodeUnifiedResponseData(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64");
}
