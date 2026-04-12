import { delay, generateWAMessageFromContent, proto } from "baileys";
import { randomBytes } from "node:crypto";
import { PREFIX } from "../../../config.js";

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
  /\b(?:async|await|class|const|default|else|export|for|from|function|if|import|let|new|return|this|var|while)\b|\b\d+(?:\.\d+)?\b|(["'`])(?:\\.|(?!\1)[\s\S])*\1/g;

const CODE_SAMPLE = `async function responderComTempo({ sendReply }) {
  const startedAt = Date.now();

  await sendReply("Processando...");

  return {
    ok: true,
    elapsedMs: Date.now() - startedAt,
  };
}`;

export default {
  name: "enviar-codigo",
  description: "Exemplo de como enviar código em Rich Response",
  commands: ["enviar-codigo", "codigo"],
  usage: `${PREFIX}enviar-codigo`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ socket, remoteJid, webMessage, sendReply, sendReact }) => {
    await sendReact("💻");

    await delay(2000);

    const richResponse = buildRichResponse([
      makeTextSubmessage("*Exemplo de código em Rich Response*"),
      makeCodeSubmessage("javascript", buildCodeBlocksFromString(CODE_SAMPLE)),
      makeTextSubmessage(
        "Esse tipo usa `AI_RICH_RESPONSE_CODE` dentro de `richResponseMessage`.",
      ),
    ]);

    await sendRichResponseMessage(socket, remoteJid, richResponse, webMessage);

    await delay(2000);

    await sendReply(
      "Use `codeMetadata.codeBlocks` quando quiser renderizar um bloco de código como resposta rica.",
    );
  },
};

function makeTextSubmessage(messageText) {
  return {
    messageType: 2,
    messageText: String(messageText || ""),
  };
}

function makeCodeSubmessage(codeLanguage, codeBlocks) {
  return {
    messageType: 5,
    codeMetadata: {
      codeLanguage,
      codeBlocks,
    },
  };
}

function buildCodeBlocksFromString(codeText) {
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

function getHighlightType(token) {
  if (/^["'`]/.test(token)) {
    return STRING_HIGHLIGHT;
  }

  if (/^\d/.test(token)) {
    return NUMBER_HIGHLIGHT;
  }

  return KEYWORD_HIGHLIGHT;
}

function buildRichResponse(submessages) {
  return {
    messageType: 1,
    submessages,
    unifiedResponse: {
      data: encodeUnifiedResponseData({
        response_id: `takeshi-code-${Date.now()}-${randomBytes(6).toString("hex")}`,
        sections: submessages.map(buildUnifiedSection).filter(Boolean),
      }),
    },
  };
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

async function sendRichResponseMessage(
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
    quoted: JSON.parse(JSON.stringify(quoted)),
  });

  return socket.relayMessage(remoteJid, waMessage.message, {
    messageId: waMessage.key.id,
  });
}

function buildBotMetadata(extraCapabilities = []) {
  return {
    modelMetadata: {
      modelType: "LLAMA_PROD",
      premiumModelStatus: "AVAILABLE",
    },
    botAgeCollectionMetadata: {},
    botResponseId: `takeshi-code-${Date.now()}-${randomBytes(6).toString("hex")}`,
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

function encodeUnifiedResponseData(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64");
}
