import { randomBytes } from "node:crypto";
import { proto } from "zapo-js";

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

export async function sendRichResponseMessage(
  socket,
  remoteJid,
  richResponse,
  quoted,
) {
  const rich = applyForwardedMetaAiContext(richResponse, remoteJid, quoted);
  const payload = new proto.Message({
    botForwardedMessage: {
      message: {
        richResponseMessage: rich,
      },
    },
    messageContextInfo: {
      messageSecret: randomBytes(32),
      botMetadata: buildBotMetadata([
        proto.BotCapabilityMetadata.BotCapabilityType.RICH_RESPONSE_CODE,
      ]),
    },
  });

  return socket.relayMessage(remoteJid, payload);
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
      modelType: proto.BotModelMetadata.ModelType.LLAMA_PROD,
      premiumModelStatus:
        proto.BotModelMetadata.PremiumModelStatus.AVAILABLE,
    },
    botAgeCollectionMetadata: {},
    botResponseId: buildResponseId("takeshi-code"),
    verificationMetadata: {
      proofs: [],
    },
    botInfrastructureDiagnostics: {},
    capabilityMetadata: {
      capabilities: [
        proto.BotCapabilityMetadata.BotCapabilityType
          .RICH_RESPONSE_STRUCTURED_RESPONSE,
        proto.BotCapabilityMetadata.BotCapabilityType
          .RICH_RESPONSE_UNIFIED_RESPONSE,
        proto.BotCapabilityMetadata.BotCapabilityType
          .RICH_RESPONSE_UNIFIED_TEXT_COMPONENT,
        proto.BotCapabilityMetadata.BotCapabilityType
          .SESSION_TRANSPARENCY_SYSTEM_MESSAGE,
        ...extraCapabilities,
      ],
    },
  };
}

function applyForwardedMetaAiContext(richResponse, remoteJid, quoted) {
  const quoteContext = quoted
    ? {
        stanzaId: quoted.key?.id,
        participant: quoted.key?.participant || quoted.key?.remoteJid,
        quotedMessage: quoted.message,
      }
    : {};

  return {
    ...richResponse,
    contextInfo: {
      ...quoteContext,
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
  return Buffer.from(JSON.stringify(value));
}
