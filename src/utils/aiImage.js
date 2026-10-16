import fs from "node:fs";
import { DangerError } from "../errors/index.js";
import { detectImageMimetype } from "../services/imageOptimizer.js";
import { getRandomName } from "./index.js";

/**
 * @param {CommandHandleProps} props
 * @returns {Promise<string|null>}
 */
export async function downloadAIImage({ isImage, downloadImage, webMessage }) {
  if (!isImage) {
    return null;
  }

  const imagePath = await downloadImage(webMessage, getRandomName());

  try {
    const buffer = fs.readFileSync(imagePath);

    if (buffer.length > 5 * 1024 * 1024) {
      throw new DangerError("A imagem deve ter no máximo 5 MB.");
    }

    const mimeType = await detectImageMimetype(buffer, null);

    if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) {
      throw new DangerError("Envie uma imagem JPEG, PNG ou WebP.");
    }

    return `data:${mimeType};base64,${buffer.toString("base64")}`;
  } finally {
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }
}
