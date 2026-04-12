import { delay, generateWAMessageFromContent, proto } from "baileys";
import { randomBytes } from "node:crypto";
import { PREFIX } from "../../../config.js";

const META_AI_BOT_JID = "867051314767696@bot";
const META_AI_BOT_NAME = "Meta AI";
const META_AI_CREATOR_NAME = "Meta";
const FORWARD_ORIGIN_META_AI = 4;
const BOT_ENTRY_POINT_INVOKE_META_AI_1ON1 = 29;
const BOT_ENTRY_POINT_INVOKE_META_AI_GROUP = 30;

const LATEX_EXPRESSION = "$$E = mc^2$$";
const LATEX_IMAGE_URL =
  "https://latex.codecogs.com/png.image?%5Cdpi%7B180%7DE%20%3D%20mc%5E2";

export default {
  name: "enviar-latex",
  description: "Exemplo de como enviar fórmula LaTeX em Rich Response",
  commands: ["enviar-latex", "latex", "formula"],
  usage: `${PREFIX}enviar-latex`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ socket, remoteJid, webMessage, sendReply, sendReact }) => {
    await sendReact("🧮");

    await delay(2000);

    const richResponse = buildRichResponse([
      makeTextSubmessage("*Fórmula matemática em LaTeX*"),
      makeLatexSubmessage({
        text: LATEX_EXPRESSION,
        expressions: [
          {
            latexExpression: LATEX_EXPRESSION,
            url: LATEX_IMAGE_URL,
            width: 328,
            height: 111,
            fontHeight: 83.33,
            imageTopPadding: 15,
            imageLeadingPadding: 15,
            imageBottomPadding: 15,
            imageTrailingPadding: 15,
          },
        ],
      }),
      makeTextSubmessage(
        "Esse tipo usa `AI_RICH_RESPONSE_LATEX`. A renderização pode depender da versão do WhatsApp do usuário.",
      ),
    ]);

    await sendRichResponseMessage(socket, remoteJid, richResponse, webMessage);

    await delay(2000);

    await sendReply(
      "Para outras fórmulas, troque `latexExpression` e a imagem renderizada usada em `url`.",
    );
  },
};

function makeTextSubmessage(messageText) {
  return {
    messageType: 2,
    messageText: String(messageText || ""),
  };
}

function makeLatexSubmessage(latexMetadata) {
  return {
    messageType: 8,
    latexMetadata,
  };
}

function buildRichResponse(submessages) {
  return {
    messageType: 1,
    submessages,
    unifiedResponse: {
      data: encodeUnifiedResponseData({
        response_id: `takeshi-latex-${Date.now()}-${randomBytes(6).toString("hex")}`,
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

  if (submessage.messageType === 8) {
    const expression = submessage.latexMetadata.expressions[0];

    return {
      view_model: {
        primitive: {
          item: {
            latex_expression:
              expression.latexExpression || submessage.latexMetadata.text || "",
            latex_image: {
              url: expression.url || "",
              width: Number(expression.width) || 0,
              height: Number(expression.height) || 0,
            },
            font_height: Number(expression.fontHeight) || 0,
            padding: Number(expression.imageTopPadding) || 15,
          },
          latex_expression:
            expression.latexExpression || submessage.latexMetadata.text || "",
          font_height: Number(expression.fontHeight) || 0,
          padding: Number(expression.imageTopPadding) || 15,
          latex_image: {
            url: expression.url || "",
            width: Number(expression.width) || 0,
            height: Number(expression.height) || 0,
          },
          __typename: "GenAILatexUXPrimitive",
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
  const rich = applyForwardedMetaAiContext(richResponse, remoteJid);
  const payload = proto.Message.fromObject({
    botForwardedMessage: {
      message: {
        richResponseMessage: rich,
      },
    },
    messageContextInfo: {
      messageSecret: randomBytes(32),
      botMetadata: buildBotMetadata([
        "RICH_RESPONSE_LATEX",
        "RICH_RESPONSE_LATEX_INLINE",
      ]),
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
    botResponseId: `takeshi-latex-${Date.now()}-${randomBytes(6).toString("hex")}`,
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
