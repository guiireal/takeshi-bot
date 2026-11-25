/**
 * Áudio das figurinhas com áudio, para o rename/take manter o som.
 *
 * O áudio vai no campo 26 da figurinha (direto ou dentro do wrapper 134),
 * mas o WhatsApp não copia esse campo para a citação. Por isso guardamos o
 * áudio pelo id quando a figurinha chega (ou quando o próprio bot envia).
 *
 * @author Dev Gui
 */
import { proto, unwrapMessage } from "zapo-js";
import { getViewOnceMessage, rememberViewOnceMessage } from "./viewOnceCache.js";

const CACHE_TYPE = "audioStickerAudio";

// O zapo guarda cada campo desconhecido como tag + tamanho + bytes; a tag de 2 bytes identifica o campo.
function readUnknownField(unknowns, tag) {
  const field = unknowns?.find((bytes) => bytes[0] === tag[0] && bytes[1] === tag[1]);

  if (!field) {
    return undefined;
  }

  let offset = 2;
  let length = 0;
  let shift = 0;
  let byte;

  do {
    byte = field[offset++];
    length += (byte & 127) * 2 ** shift;
    shift += 7;
  } while (byte & 128);

  return field.subarray(offset, offset + length);
}

/** Lê o áudio de uma figurinha com áudio: campo 26 da figurinha, direto ou dentro do wrapper 134. */
export function getAudioStickerAudio(message) {
  try {
    const wrapper = readUnknownField(message?.$unknowns, [0xb2, 0x08]);
    const audio =
      readUnknownField(message?.stickerMessage?.$unknowns, [0xd2, 0x01]) ??
      (wrapper &&
        readUnknownField(
          proto.Message.FutureProofMessage.decode(wrapper).message?.stickerMessage?.$unknowns,
          [0xd2, 0x01],
        ));

    return audio ? proto.Message.AudioMessage.decode(audio) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * shortcut: divide o cache de visualização única (30 min, 300 itens, some no restart);
 * se precisar de mais, criar cache próprio.
 */
export function rememberAudioSticker(chatJid, id, message) {
  const audio = getAudioStickerAudio(unwrapMessage(message) || message);

  if (audio) {
    rememberViewOnceMessage({ chatJid, id, type: CACHE_TYPE, content: audio });
  }
}

/** Áudio da figurinha citada: da própria citação ou do que guardamos quando ela chegou. */
export function getQuotedAudioSticker(webMessage, chatJid) {
  const contextInfo = webMessage?.message?.extendedTextMessage?.contextInfo;
  const quoted = contextInfo?.quotedMessage;

  return (
    getAudioStickerAudio(unwrapMessage(quoted) || quoted) ??
    getViewOnceMessage({ chatJid, id: contextInfo?.stanzaId, type: CACHE_TYPE })
  );
}
