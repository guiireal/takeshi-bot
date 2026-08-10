/**
 * Helpers de imagem sem sharp.
 *
 * sharp e @zapo-js/media-utils foram removidos (nativos/libvips).
 * A API antiga é mantida como no-op; mimetype usa file-type.
 *
 * @author Dev Gui
 */
import { fileTypeFromBuffer } from "file-type";

/**
 * Antes redimensionava/convertia via sharp. Agora devolve o buffer original.
 *
 * @param {Buffer|Uint8Array} buffer
 * @returns {Promise<Buffer|Uint8Array>}
 */
export async function optimizeImageBuffer(buffer) {
  return buffer;
}

/**
 * Sem sharp não há pipeline de otimização.
 *
 * @returns {Promise<boolean>}
 */
export async function needsOptimization() {
  return false;
}

export function clearImageCache() {}

/**
 * Detecta mimetype de imagem (necessário sem media processor do zapo).
 *
 * @param {Buffer|Uint8Array} buffer
 * @param {string} [fallback="image/jpeg"]
 * @returns {Promise<string>}
 */
export async function detectImageMimetype(buffer, fallback = "image/jpeg") {
  try {
    const type = await fileTypeFromBuffer(buffer);

    if (type?.mime?.startsWith("image/")) {
      return type.mime;
    }
  } catch {
    // ignore
  }

  return fallback;
}

/**
 * Detecta mimetype genérico.
 *
 * @param {Buffer|Uint8Array} buffer
 * @param {string} fallback
 * @returns {Promise<string>}
 */
export async function detectMimetype(buffer, fallback) {
  try {
    const type = await fileTypeFromBuffer(buffer);

    if (type?.mime) {
      return type.mime;
    }
  } catch {
    // ignore
  }

  return fallback;
}
