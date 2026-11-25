import DangerError from "./DangerError.js";
import InvalidParameterError from "./InvalidParameterError.js";
import WarningError from "./WarningError.js";

export { DangerError, InvalidParameterError, WarningError };

export class AudioStickerUploadTooLargeError extends WarningError {
  constructor(media) {
    super(media === "sticker"
      ? "A figurinha ficou grande demais para enviar. Tente um vídeo mais curto ou outra mídia."
      : "O áudio ficou grande demais para enviar. Tente um trecho mais curto.");
    this.name = media === "sticker" ? "StickerUploadTooLarge" : "AudioUploadTooLarge";
    this.media = media;
  }
}
