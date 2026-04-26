import { delay, generateWAMessageFromContent, proto } from "baileys";
import { randomBytes } from "node:crypto";
import { PREFIX } from "../../../config.js";

const META_AI_BOT_JID = "867051314767696@bot";
const META_AI_BOT_NAME = "Meta AI";
const META_AI_CREATOR_NAME = "Meta";
const FORWARD_ORIGIN_META_AI = 4;
const BOT_ENTRY_POINT_INVOKE_META_AI_1ON1 = 29;
const BOT_ENTRY_POINT_INVOKE_META_AI_GROUP = 30;

const PROFILE_PICTURE_URL =
  "https://instagram.fcgh10-1.fna.fbcdn.net/v/t51.2885-19/464486680_539304252164138_1252595383282191812_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby41OTMuYzIifQ&_nc_ht=instagram.fcgh10-1.fna.fbcdn.net&_nc_cat=102&_nc_oc=Q6cZ2gGcRs5wB9-AAB9iBE4A08iA6KD0Z2wVcDChOw7HcSnmaBi3tHu_GqVgSjFIGHxDgV7xqY-xwhP8Ddx3K9KDyHe_&_nc_ohc=vdpr-JSrTN0Q7kNvwHSOaem&_nc_gid=w6e6L_a9oniiGi7A8VdO0Q&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_Af33Tcmvun3fOip9WOxL02NHkmh3GSwUBYd2SYLsf6eHdA&oe=69F41ABD&_nc_sid=7a9f4b";
const MAIN_TEXT = "Reels no WhatsApp";

const REEL_ITEMS = [
  {
    title: "Dev Gui",
    profileIconUrl: PROFILE_PICTURE_URL,
    thumbnailUrl:
      "https://p77-sign-va.tiktokcdn.com/tos-maliva-p-0068/03fcbc862dbd4d97b857f7ca9d510d57_1728870269~tplv-tiktokx-origin.image?dr=14575&x-expires=1777388400&x-signature=WQNXZGzgRybLxYwsupPvGUXEFPc%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=my2",
    videoUrl: "https://www.tiktok.com/@guiireal/video/7425441211613220101",
    source: "TT",
  },
  {
    title: "Dev Gui",
    profileIconUrl: PROFILE_PICTURE_URL,
    thumbnailUrl:
      "https://instagram.fcgh10-1.fna.fbcdn.net/v/t51.71878-15/491433614_1607589536600484_8415149229338072627_n.jpg?stp=dst-jpg_e15_tt6&_nc_cat=102&ig_cache_key=MzEwNzI3Mjk0NTcyNTIxMjgyNg%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjQwOHg3MjYuc2RyLkMzIn0%3D&_nc_ohc=2QkaY__xINkQ7kNvwFuU7FX&_nc_oc=AdopX3oMUpmiuygjSMx0U2degM5KyX-jLMYqBrxVHQWbpLYZNmUbBVRF0WtwOq8agldYFYVNwg3T8zz0X_BPbWMm&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fcgh10-1.fna&_nc_gid=VbLCGFsddAL6Ne30ucdWzA&_nc_ss=7a22e&oh=00_Af1d1SVcvKf1QjKpqb8v4JJrrtnUi-nwk_w-ByErl9t2Pw&oe=69F3F2EA",
    videoUrl: "https://www.instagram.com/reel/CsfQEf2Igia/",
    source: "IG",
  },
  {
    title: "Dev Gui",
    profileIconUrl: PROFILE_PICTURE_URL,
    thumbnailUrl:
      "https://instagram.fcgh10-2.fna.fbcdn.net/v/t51.71878-15/491421181_1027633322797181_4564860355533563396_n.jpg?stp=dst-jpg_e15_tt6&_nc_cat=109&ig_cache_key=MzExMjc1MjExMDgzNDI5NjE1Mg%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjQyOXgyMzYuc2RyLkMzIn0%3D&_nc_ohc=_Sg7tcZ3Tr4Q7kNvwGszckR&_nc_oc=AdpzVDjxC4ZWMqInTalABvxv_fLbrg7Ftaup65odMpFQ0l8c2FT4GVX6QVfk32nMs7gHICYHiYj7qV3zAupsIJPH&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=instagram.fcgh10-2.fna&_nc_gid=VbLCGFsddAL6Ne30ucdWzA&_nc_ss=7a22e&oh=00_Af0zyLEKh-ZYVW3YtlyPbgutG9pcqMi5yxUGoyrZnunMLw&oe=69F3EDD0",
    videoUrl: "https://www.instagram.com/reel/DBQ9hdsyYfx/",
    source: "IG",
  },
];

export default {
  name: "enviar-reels",
  description: "Exemplo de como enviar reels em Rich Response",
  commands: ["enviar-reels", "reels", "rich-reels"],
  usage: `${PREFIX}enviar-reels`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ socket, remoteJid, webMessage, sendReply, sendReact }) => {
    await sendReact("🎬");

    await delay(2000);

    const richResponse = buildRichResponse([
      makeTextSubmessage(MAIN_TEXT),
      makeReelsSubmessage(REEL_ITEMS),
    ]);

    await sendRichResponseMessage(socket, remoteJid, richResponse, webMessage);

    await delay(2000);

    await sendReply(
      "Esse exemplo usa `messageType: 9` com `contentItemsMetadata.itemsMetadata[].reelItem` e também preenche as fontes em `richResponseSourcesMetadata`.",
    );
  },
};

function makeTextSubmessage(messageText) {
  return {
    messageType: 2,
    messageText: String(messageText || ""),
  };
}

function makeTableSubmessage(title, rows) {
  return {
    messageType: 4,
    tableMetadata: {
      title,
      rows: rows.map((row) => ({
        items: row.items.map((item) => String(item ?? "")),
        isHeading: !!row.isHeading,
      })),
    },
  };
}

function makeReelsSubmessage(items) {
  return {
    messageType: 9,
    contentItemsMetadata: {
      contentType: 1,
      itemsMetadata: items.map((item) => ({
        reelItem: {
          title: item.title,
          profileIconUrl: item.profileIconUrl,
          thumbnailUrl: item.thumbnailUrl,
          videoUrl: item.videoUrl,
        },
      })),
    },
  };
}

function buildRichResponse(submessages) {
  return {
    messageType: 1,
    submessages,
    unifiedResponse: {
      data: encodeUnifiedResponseData({
        response_id: `takeshi-reels-${Date.now()}-${randomBytes(6).toString("hex")}`,
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
          title: submessage.tableMetadata.title,
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

  if (submessage.messageType === 9) {
    return {
      view_model: {
        primitives: submessage.contentItemsMetadata.itemsMetadata.map(
          ({ reelItem }) => ({
            reels_url: reelItem.videoUrl,
            thumbnail_url: reelItem.thumbnailUrl,
            creator: reelItem.title,
            avatar_url: reelItem.profileIconUrl,
            reels_title: "Descrição bonitinha..",
            likes_count: 0,
            shares_count: 0,
            view_count: 0,
            reel_source: getReelSource(reelItem.videoUrl),
            is_verified: true,
            __typename: "GenAIReelPrimitive",
          }),
        ),
        __typename: "GenAIHScrollLayoutViewModel",
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
      deviceListMetadata: {},
      deviceListMetadataVersion: 2,
      messageSecret: randomBytes(32),
      botMetadata: buildBotMetadata(buildRichResponseSources(REEL_ITEMS), [
        "RICH_RESPONSE_REELS",
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

function buildRichResponseSources(items) {
  return items.map((item, index) => ({
    provider: "UNKNOWN",
    thumbnailCDNURL: item.thumbnailUrl,
    sourceProviderURL: item.videoUrl,
    sourceQuery: "",
    faviconCDNURL: item.profileIconUrl,
    citationNumber: index + 1,
    sourceTitle: item.title,
  }));
}

function buildBotMetadata(sources = [], extraCapabilities = []) {
  return {
    modelMetadata: {
      modelType: "LLAMA_PROD",
      premiumModelStatus: "AVAILABLE",
    },
    botAgeCollectionMetadata: {},
    botResponseId: `takeshi-reels-${Date.now()}-${randomBytes(6).toString("hex")}`,
    verificationMetadata: {
      proofs: [],
    },
    botInfrastructureDiagnostics: {},
    richResponseSourcesMetadata: {
      sources,
    },
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

function getReelSource(videoUrl) {
  return String(videoUrl || "").includes("tiktok.com") ? "TT" : "IG";
}

function encodeUnifiedResponseData(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64");
}
