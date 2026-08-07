/**
 * Camada de compatibilidade entre o zapo-js (WaClient) e a
 * API de "socket" que o resto do bot espera, herdada da época
 * da Baileys. Mantém `sendMessage`, `groupMetadata`,
 * `groupParticipantsUpdate` etc. com a mesma assinatura de sempre,
 * traduzindo cada chamada para o coordinator correspondente do zapo.
 *
 * @author Dev Gui
 */
import { buildInteractiveContent } from "./interactiveMessages.js";

const GROUP_PARTICIPANT_ACTIONS = {
  add: (client, jid, participants) =>
    client.group.addParticipants(jid, participants),
  remove: (client, jid, participants) =>
    client.group.removeParticipants(jid, participants),
  promote: (client, jid, participants) =>
    client.group.promoteParticipants(jid, participants),
  demote: (client, jid, participants) =>
    client.group.demoteParticipants(jid, participants),
};

const GROUP_SETTING_MAP = {
  announcement: ["announcement", true],
  not_announcement: ["announcement", false],
  locked: ["restrict", true],
  unlocked: ["restrict", false],
};

function translateParticipant(participant) {
  let admin = null;

  if (participant.isSuperAdmin) {
    admin = "superadmin";
  } else if (participant.isAdmin) {
    admin = "admin";
  }

  return {
    ...participant,
    id: participant.jid,
    admin,
  };
}

function translateGroupMetadata(metadata) {
  if (!metadata) {
    return metadata;
  }

  return {
    ...metadata,
    id: metadata.jid,
    participants: (metadata.participants || []).map(translateParticipant),
  };
}

function resolveSendOptions(content, options = {}) {
  const sendOptions = {};

  if (options.quoted) {
    sendOptions.quote = options.quoted;
  }

  const mentions = content?.mentions || options.mentions;

  if (mentions?.length) {
    sendOptions.mentions = mentions;
  }

  if (options.messageId) {
    sendOptions.id = options.messageId;
  }

  return sendOptions;
}

function resolveMediaSource(rawValue) {
  if (rawValue && typeof rawValue === "object" && "url" in rawValue) {
    return rawValue.url;
  }

  return rawValue;
}

/**
 * O zapo resolve o envio em um `WaMessagePublishResult` com `.id` (stanza id),
 * sem o `.key` que o resto do código (helpers de edição, deletePaymentMessage)
 * espera no estilo Baileys. Sintetiza esse `.key` de volta no retorno.
 */
function attachBaileysStyleKey(jid, result) {
  if (!result || typeof result !== "object") {
    return result;
  }

  return {
    ...result,
    key: {
      remoteJid: jid,
      fromMe: true,
      id: result.id,
    },
  };
}

/**
 * @param {import("zapo-js").WaClient} client
 */
export function createSocketAdapter(client) {
  const socket = {
    async sendMessage(jid, content, options = {}) {
      const sendOptions = resolveSendOptions(content, options);

      const send = async (payload, opts = sendOptions) =>
        attachBaileysStyleKey(jid, await client.message.send(jid, payload, opts));

      if (content.react) {
        return send({
          type: "reaction",
          emoji: content.react.text,
          target: content.react.key,
        });
      }

      if (content.delete) {
        return send({
          type: "revoke",
          target: content.delete,
        });
      }

      if (content.poll) {
        return send({
          type: "poll",
          name: content.poll.name,
          options: content.poll.values,
          selectableCount: content.poll.selectableCount || 0,
        });
      }

      if (content.contacts) {
        const { displayName, contacts = [] } = content.contacts;

        if (contacts.length === 1) {
          return send({
            contactMessage: {
              displayName,
              vcard: contacts[0].vcard,
            },
          });
        }

        return send({
          contactsArrayMessage: {
            displayName,
            contacts: contacts.map((contact) => ({
              displayName,
              vcard: contact.vcard,
            })),
          },
        });
      }

      if (content.location) {
        return send({
          locationMessage: {
            degreesLatitude: content.location.degreesLatitude,
            degreesLongitude: content.location.degreesLongitude,
          },
        });
      }

      if (content.edit) {
        sendOptions.editKey = content.edit;

        return send({ type: "text", text: content.text });
      }

      if (
        content.buttons ||
        content.interactiveButtons ||
        content.sections ||
        content.cards
      ) {
        const interactivePayload = await buildInteractiveContent(
          client,
          content,
        );

        return send(interactivePayload);
      }

      if (typeof content.text === "string") {
        return send({ type: "text", text: content.text });
      }

      const mediaType = ["image", "video", "audio", "document", "sticker"].find(
        (type) => content[type] !== undefined,
      );

      if (mediaType) {
        return send({
          type: mediaType,
          media: resolveMediaSource(content[mediaType]),
          mimetype: content.mimetype,
          caption: content.caption,
          fileName: content.fileName,
          ptt: content.ptt,
          gifPlayback: content.gifPlayback,
        });
      }

      return send(content);
    },

    async relayMessage(jid, message, options = {}) {
      const sendOptions = resolveSendOptions(message, options);

      return attachBaileysStyleKey(
        jid,
        await client.message.send(jid, message, sendOptions),
      );
    },

    async groupMetadata(jid) {
      const metadata = await client.group.queryGroupMetadata(jid);
      return translateGroupMetadata(metadata);
    },

    async groupParticipantsUpdate(jid, participants, action) {
      const handler = GROUP_PARTICIPANT_ACTIONS[action];

      if (!handler) {
        throw new Error(`Ação de grupo desconhecida: ${action}`);
      }

      return handler(client, jid, participants);
    },

    async groupSettingUpdate(jid, setting) {
      const mapped = GROUP_SETTING_MAP[setting];

      if (!mapped) {
        throw new Error(`Configuração de grupo desconhecida: ${setting}`);
      }

      const [zapoSetting, enabled] = mapped;
      return client.group.setSetting(jid, zapoSetting, enabled);
    },

    async groupUpdateSubject(jid, subject) {
      return client.group.setSubject(jid, subject);
    },

    async groupInviteCode(jid) {
      return client.group.queryInviteCode(jid);
    },

    async updateBlockStatus(jid, action) {
      return action === "block"
        ? client.privacy.blockUser(jid)
        : client.privacy.unblockUser(jid);
    },

    async sendPresenceUpdate(type, jid) {
      if (
        type === "composing" ||
        type === "recording" ||
        type === "paused"
      ) {
        return client.presence.sendChatstate(jid, { state: type });
      }

      return client.presence.send(type);
    },

    async profilePictureUrl(jid, type = "preview") {
      const result = await client.profile.getProfilePicture(jid, type);

      if (!result?.url) {
        throw new Error("Sem foto de perfil");
      }

      return result.url;
    },

    get user() {
      const credentials = client.getCredentials();
      return credentials ? { id: credentials.meJid } : null;
    },

    get authState() {
      return { creds: client.getCredentials() || {} };
    },

    client,
  };

  return socket;
}
