/**
 * Otimização e conversão de imagens usando sharp.
 *
 * O WhatsApp não aceita WebP em mensagens de imagem comuns (apenas em stickers).
 * Esta função converte qualquer formato suportado pelo sharp para JPEG/JPG,
 * que é aceito pelo WhatsApp e pelo zapo-js.
 *
 * Baseado na implementação do spider-bot-x.
 *
 * @author Dev Gui
 */
import sharp from "sharp";

const DEFAULT_MAX_WIDTH = 1280;
const DEFAULT_MAX_HEIGHT = 1280;
const DEFAULT_QUALITY = 85;

export async function optimizeImageBuffer(
  buffer,
  options = {},
) {
  const opts = {
    maxWidth: DEFAULT_MAX_WIDTH,
    maxHeight: DEFAULT_MAX_HEIGHT,
    quality: DEFAULT_QUALITY,
    format: "jpeg",
    keepMetadata: false,
    ...options,
  };

  try {
    sharp.cache(false);
    sharp.concurrency(1);

    let pipeline = sharp(buffer);

    const metadata = await pipeline.metadata();

    if (metadata.width > opts.maxWidth || metadata.height > opts.maxHeight) {
      pipeline = pipeline.resize(opts.maxWidth, opts.maxHeight, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    if (opts.format === "png") {
      pipeline = pipeline.png({
        quality: opts.quality,
        compressionLevel: 9,
        adaptiveFiltering: true,
      });
    } else {
      pipeline = pipeline.jpeg({
        quality: opts.quality,
        progressive: true,
        optimizeScans: true,
        mozjpeg: true,
      });
    }

    if (!opts.keepMetadata) {
      pipeline = pipeline.withMetadata({
        orientation: metadata.orientation || 1,
      });
    }

    return await pipeline.toBuffer();
  } catch (error) {
    console.error("Erro ao otimizar imagem:", error);
    return buffer;
  }
}

export async function needsOptimization(buffer) {
  try {
    const metadata = await sharp(buffer).metadata();
    const sizeMB = buffer.length / 1024 / 1024;

    return (
      sizeMB > 1 ||
      metadata.width > DEFAULT_MAX_WIDTH ||
      metadata.height > DEFAULT_MAX_HEIGHT ||
      !["jpeg", "jpg", "png"].includes(metadata.format)
    );
  } catch {
    return false;
  }
}

export function clearImageCache() {
  sharp.cache(false);
}
