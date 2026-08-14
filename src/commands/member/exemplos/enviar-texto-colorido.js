import { randomBytes } from "node:crypto";
import { delay, proto } from "zapo-js";
import { PREFIX } from "../../../config.js";

const META_AI_BOT_JID = "867051314767696@bot";
const META_AI_BOT_NAME = "Meta AI";
const META_AI_CREATOR_NAME = "Meta";
const FORWARD_ORIGIN_META_AI = 4;
const BOT_ENTRY_POINT_INVOKE_META_AI_1ON1 = 29;
const BOT_ENTRY_POINT_INVOKE_META_AI_GROUP = 30;

const DEFAULT_TEXT = "EXEMPLO DE TEXTO COLORIDO";

export default {
  name: "enviar-texto-colorido",
  description: "Exemplo de como enviar texto colorido em Rich Response",
  commands: ["enviar-texto-colorido", "texto-colorido", "rich-texto"],
  usage: `${PREFIX}enviar-texto-colorido <texto>`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    socket,
    remoteJid,
    webMessage,
    fullArgs,
    sendReply,
    sendReact,
  }) => {
    await sendReact("🎨");

    await delay(2000);

    const text = fullArgs?.trim() || DEFAULT_TEXT;
    const richResponse = buildRichResponse([
      makeTextSubmessage(toHighlightedMarkdown(text)),
    ]);

    await sendRichResponseMessage(socket, remoteJid, richResponse, webMessage);

    await delay(2000);

    await sendReply(
      "Esse exemplo usa `richResponseMessage` com `AI_RICH_RESPONSE_TEXT`. O destaque amarelo tenta seguir o Markdown `# ==( texto )==`.",
    );
  },
};

function toHighlightedMarkdown(text) {
  return `# ==( ${String(text || DEFAULT_TEXT).trim()} )==`;
}

function makeTextSubmessage(messageText) {
  return {
    messageType: 2,
    messageText: String(messageText || ""),
  };
}

function buildRichResponse(submessages) {
  return {
    messageType: 1,
    submessages,
    unifiedResponse: {
      data: encodeUnifiedResponseData({
        response_id: `takeshi-color-text-${Date.now()}-${randomBytes(6).toString("hex")}`,
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

  return null;
}

async function sendRichResponseMessage(
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
      botMetadata: buildBotMetadata(),
    },
  });

  return socket.relayMessage(remoteJid, payload);
}

function buildBotMetadata(extraCapabilities = []) {
  return {
    modelMetadata: {
      modelType: proto.BotModelMetadata.ModelType.LLAMA_PROD,
      premiumModelStatus:
        proto.BotModelMetadata.PremiumModelStatus.AVAILABLE,
    },
    botAgeCollectionMetadata: {},
    botResponseId: `takeshi-color-text-${Date.now()}-${randomBytes(6).toString("hex")}`,
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

function encodeUnifiedResponseData(value) {
  return Buffer.from(JSON.stringify(value));
}
