/**
 * Traduz o DSL de alto nível herdado da Baileys (buttons, interactiveButtons,
 * sections, cards) para os campos de protobuf que o WhatsApp realmente espera
 * (interactiveMessage/native_flow, buttonsMessage, listMessage). Antes disso
 * dependia de um patch binário na Baileys; agora é só construção de objeto,
 * enviada como Proto.IMessage cru pela zapo-js.
 *
 * @author Dev Gui
 */
import { fileTypeFromBuffer } from "file-type";
import { proto } from "zapo-js";

function normalizeNativeFlowButton(button, index) {
  if (!button) {
    return button;
  }

  if (typeof button.name === "string") {
    let params = button.buttonParamsJson;

    if (typeof params === "string" && params) {
      try {
        params = JSON.parse(params);
      } catch {
        return { name: button.name, buttonParamsJson: params };
      }
    }

    if (params && typeof params === "object") {
      if (button.name === "cta_url" && params.url && !params.merchant_url) {
        params = { ...params, merchant_url: params.url };
      }
      params = JSON.stringify(params);
    }

    return { name: button.name, buttonParamsJson: params || "{}" };
  }

  return {
    name: "quick_reply",
    buttonParamsJson: JSON.stringify({
      display_text:
        button.buttonText?.displayText ||
        button.displayText ||
        button.text ||
        `Opcao ${index + 1}`,
      id: button.buttonId || button.id || `button_${index + 1}`,
    }),
  };
}

function withMentions(contextInfo, mentions) {
  if (!mentions?.length) {
    return contextInfo;
  }

  return { ...contextInfo, mentionedJid: mentions };
}

function buildLegacyButtonsMessage(content) {
  const buttonsMessage = {
    buttons: content.buttons.map((button) => ({
      ...button,
      type: proto.Message.ButtonsMessage.Button.Type.RESPONSE,
    })),
  };

  if (content.text) {
    buttonsMessage.contentText = content.text;
    buttonsMessage.headerType = proto.Message.ButtonsMessage.HeaderType.EMPTY;
  } else if (content.caption) {
    buttonsMessage.contentText = content.caption;
    buttonsMessage.headerType = proto.Message.ButtonsMessage.HeaderType.EMPTY;
  }

  if (content.footer) {
    buttonsMessage.footerText = content.footer;
  }

  if (content.title) {
    buttonsMessage.text = content.title;
    buttonsMessage.headerType = proto.Message.ButtonsMessage.HeaderType.TEXT;
  }

  buttonsMessage.contextInfo = withMentions(
    buttonsMessage.contextInfo,
    content.mentions,
  );

  return { payload: { buttonsMessage }, viewOnce: !!content.viewOnce };
}

function buildNativeFlowButtonsMessage(content) {
  const interactiveMessage = {
    body: { text: content.text || content.caption || "" },
    header: { title: content.title, subtitle: content.subtitle, hasMediaAttachment: false },
    nativeFlowMessage: {
      buttons: content.buttons.map(normalizeNativeFlowButton),
    },
  };

  if (content.footer) {
    interactiveMessage.footer = { text: content.footer };
  }

  interactiveMessage.contextInfo = withMentions(
    interactiveMessage.contextInfo,
    content.mentions,
  );

  return {
    payload: { interactiveMessage },
    viewOnce: content.viewOnce ?? true,
  };
}

function buildInteractiveButtonsMessage(content) {
  const interactiveMessage = {
    nativeFlowMessage: {
      buttons: content.interactiveButtons.map(normalizeNativeFlowButton),
    },
  };

  if (content.text || content.caption) {
    interactiveMessage.body = { text: content.text || content.caption };
    interactiveMessage.header = { hasMediaAttachment: false };
  }

  if (content.footer) {
    interactiveMessage.footer = { text: content.footer };
  }

  interactiveMessage.contextInfo = withMentions(
    interactiveMessage.contextInfo,
    content.mentions,
  );

  return {
    payload: { interactiveMessage },
    viewOnce: content.viewOnce ?? true,
  };
}

function buildLegacyListMessage(content) {
  const listMessage = {
    sections: content.sections,
    buttonText: content.buttonText,
    title: content.title,
    footerText: content.footer,
    description: content.text,
    listType: proto.Message.ListMessage.ListType.SINGLE_SELECT,
  };

  listMessage.contextInfo = withMentions(
    listMessage.contextInfo,
    content.mentions,
  );

  return { payload: { listMessage }, viewOnce: !!content.viewOnce };
}

function buildNativeFlowListMessage(content) {
  const sections = content.sections.map((section) => ({
    title: section.title,
    highlight_label: section.highlight_label,
    rows: (section.rows || []).map((row, index) => ({
      title: row.title,
      description: row.description,
      id: row.rowId || row.id || `row_${index + 1}`,
    })),
  }));

  const interactiveMessage = {
    body: { text: content.text || "" },
    header: {
      title: content.title,
      subtitle: content.subtitle,
      hasMediaAttachment: false,
    },
    nativeFlowMessage: {
      buttons: [
        {
          name: "single_select",
          buttonParamsJson: JSON.stringify({
            title: content.buttonText || content.title || "Selecionar",
            sections,
          }),
        },
      ],
      messageParamsJson: "{}",
      messageVersion: 1,
    },
  };

  if (content.footer) {
    interactiveMessage.footer = { text: content.footer };
  }

  interactiveMessage.contextInfo = withMentions(
    interactiveMessage.contextInfo,
    content.mentions,
  );

  return {
    payload: { interactiveMessage },
    viewOnce: content.viewOnce ?? true,
  };
}

async function fetchMediaBytes(mediaField) {
  if (mediaField && typeof mediaField === "object" && "url" in mediaField) {
    const response = await fetch(mediaField.url);

    if (!response.ok) {
      throw new Error(
        `Falha ao baixar mídia do card: ${response.status} ${response.statusText}`,
      );
    }

    return Buffer.from(await response.arrayBuffer());
  }

  return mediaField;
}

async function buildCardHeader(client, card) {
  const mediaField = card.image || card.video;

  if (!mediaField) {
    return { title: card.title, hasMediaAttachment: false };
  }

  const buffer = await fetchMediaBytes(mediaField);
  const detected = await fileTypeFromBuffer(buffer);
  const type = card.video ? "video" : "image";
  const mimetype = mediaField.mimetype || detected?.mime || `${type}/jpeg`;

  const uploaded = await client.message.upload(buffer, { type, mimetype });

  const mediaMessageKey = type === "video" ? "videoMessage" : "imageMessage";

  return {
    title: card.title,
    hasMediaAttachment: true,
    [mediaMessageKey]: {
      url: uploaded.url,
      directPath: uploaded.directPath,
      mediaKey: uploaded.mediaKey,
      fileSha256: uploaded.fileSha256,
      fileEncSha256: uploaded.fileEncSha256,
      fileLength: uploaded.fileLength,
      mediaKeyTimestamp: uploaded.mediaKeyTimestamp,
      mimetype: uploaded.mimetype || mimetype,
    },
  };
}

async function buildCarouselMessage(client, content) {
  const cards = await Promise.all(
    content.cards.map(async (card) => ({
      header: await buildCardHeader(client, card),
      body: { text: card.caption },
      footer: { text: card.footer },
      nativeFlowMessage: {
        buttons: (card.buttons || []).map(normalizeNativeFlowButton),
      },
    })),
  );

  const interactiveMessage = {
    carouselMessage: {
      cards,
      messageVersion: 1,
    },
  };

  if (content.text) {
    interactiveMessage.body = { text: content.text };
    interactiveMessage.header = {
      title: content.title,
      subtitle: content.subtitle,
      hasMediaAttachment: false,
    };
  }

  if (content.footer) {
    interactiveMessage.footer = { text: content.footer };
  }

  interactiveMessage.contextInfo = withMentions(
    interactiveMessage.contextInfo,
    content.mentions,
  );

  return {
    payload: { interactiveMessage },
    viewOnce: !!content.viewOnce,
  };
}

function wrapViewOnce(payload, viewOnce) {
  if (!viewOnce) {
    return payload;
  }

  return { viewOnceMessageV2: { message: payload } };
}

/**
 * Detecta se `content` usa o DSL de botões/lista/carrossel herdado da
 * Baileys e, se sim, monta o Proto.IMessage cru correspondente.
 * Retorna `null` quando `content` não usa nenhum desses formatos.
 */
export async function buildInteractiveContent(client, content) {
  if (content.buttons) {
    const { payload, viewOnce } = content.useLegacyButtons
      ? buildLegacyButtonsMessage(content)
      : buildNativeFlowButtonsMessage(content);

    return wrapViewOnce(payload, viewOnce);
  }

  if (content.interactiveButtons) {
    const { payload, viewOnce } = buildInteractiveButtonsMessage(content);
    return wrapViewOnce(payload, viewOnce);
  }

  if (content.cards) {
    const { payload, viewOnce } = await buildCarouselMessage(client, content);
    return wrapViewOnce(payload, viewOnce);
  }

  if (content.sections) {
    const { payload, viewOnce } = content.useLegacyList
      ? buildLegacyListMessage(content)
      : buildNativeFlowListMessage(content);

    return wrapViewOnce(payload, viewOnce);
  }

  return null;
}
