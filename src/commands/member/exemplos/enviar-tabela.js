import { delay, generateWAMessageFromContent, proto } from "baileys";
import { randomBytes } from "node:crypto";
import { PREFIX } from "../../../config.js";

const META_AI_BOT_JID = "867051314767696@bot";
const META_AI_BOT_NAME = "Meta AI";
const META_AI_CREATOR_NAME = "Meta";
const FORWARD_ORIGIN_META_AI = 4;
const BOT_ENTRY_POINT_INVOKE_META_AI_1ON1 = 29;
const BOT_ENTRY_POINT_INVOKE_META_AI_GROUP = 30;

const TABLE_ROWS = [
  ["Comando", "Helper", "Uso"],
  ["menu", "sendReply", "Lista comandos"],
  ["sticker", "downloadImage", "Cria figurinha"],
  ["play-audio", "sendAudioFromBuffer", "Envia audio"],
];

export default {
  name: "enviar-tabela",
  description: "Exemplo de como enviar tabela em Rich Response",
  commands: ["enviar-tabela", "tabela"],
  usage: `${PREFIX}enviar-tabela`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ socket, remoteJid, webMessage, sendReply, sendReact }) => {
    await sendReact("📊");

    await delay(2000);

    const richResponse = buildRichResponse([
      makeTextSubmessage("*Tabela de comandos e helpers*"),
      makeTableSubmessage(buildTableRows(TABLE_ROWS)),
      makeTextSubmessage(
        "Esse tipo usa `AI_RICH_RESPONSE_TABLE` com a primeira linha marcada como cabeçalho.",
      ),
    ]);

    await sendRichResponseMessage(socket, remoteJid, richResponse, webMessage);

    await delay(2000);

    await sendReply(
      "Use `tableMetadata.rows` para montar linhas de tabela compatíveis com o rich response.",
    );
  },
};

function makeTextSubmessage(messageText) {
  return {
    messageType: 2,
    messageText: String(messageText || ""),
  };
}

function makeTableSubmessage(rows) {
  return {
    messageType: 4,
    tableMetadata: {
      rows,
    },
  };
}

function buildTableRows(rows) {
  return rows.map((items, index) => ({
    items: items.map((value) => String(value ?? "")),
    isHeading: index === 0,
  }));
}

function buildRichResponse(submessages) {
  return {
    messageType: 1,
    submessages,
    unifiedResponse: {
      data: encodeUnifiedResponseData({
        response_id: `takeshi-table-${Date.now()}-${randomBytes(6).toString("hex")}`,
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

  if (submessage.messageType === 4) {
    return {
      view_model: {
        primitive: {
          rows: submessage.tableMetadata.rows.map((row) => ({
            is_header: !!row.isHeading,
            cells: row.items.map((value) => String(value ?? "")),
          })),
          __typename: "GenATableUXPrimitive",
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
      botMetadata: buildBotMetadata(["RICH_RESPONSE_TABLE"]),
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
    botResponseId: `takeshi-table-${Date.now()}-${randomBytes(6).toString("hex")}`,
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
