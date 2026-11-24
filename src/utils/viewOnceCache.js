/**
 * Cache em memória do conteúdo de mensagens de visualização única.
 *
 * O WhatsApp remove o texto e mediaKey/directPath quando a mensagem é citada
 * (contextInfo.quotedMessage só traz `viewOnce: true`). Guardamos o conteúdo
 * quando a mensagem original chega, por um tempo curto e preso ao chat de
 * origem, sem salvar o arquivo de mídia.
 *
 * Volátil de propósito: se o bot reiniciar ou o prazo vencer, o comando
 * volta a falhar como antes, nunca revela nada além do que o bot recebeu.
 */

const VIEW_ONCE_TTL_MS = 30 * 60 * 1000;
const MAX_ENTRIES = 300;

const cache = new Map();

function keyOf(chatJid, id) {
  return `${chatJid}:${id}`;
}

function prune() {
  const now = Date.now();

  for (const [key, entry] of cache) {
    if (now - entry.ts > VIEW_ONCE_TTL_MS) {
      cache.delete(key);
    }
  }

  while (cache.size > MAX_ENTRIES) {
    cache.delete(cache.keys().next().value);
  }
}

/**
 * @param {{ chatJid?: string, id?: string, type: string, content?: object }} params
 * type é a chave do proto, ex.: "imageMessage".
 */
export function rememberViewOnceMessage({ chatJid, id, type, content }) {
  const hasContent =
    type === "extendedTextMessage"
      ? typeof content?.text === "string" && content.text.length > 0
      : !!content?.mediaKey;

  if (!chatJid || !id || !hasContent) {
    return;
  }

  cache.set(keyOf(chatJid, id), { type, content, ts: Date.now() });
  prune();
}

/**
 * Só devolve o conteúdo se o id foi visto NESTE chat e é do tipo pedido: o
 * stanzaId do quote é fornecido pelo cliente e pode apontar para outro grupo.
 */
export function getViewOnceMessage({ chatJid, id, type }) {
  if (!chatJid || !id) {
    return undefined;
  }

  const key = keyOf(chatJid, id);
  const entry = cache.get(key);

  if (!entry) {
    return undefined;
  }

  if (Date.now() - entry.ts > VIEW_ONCE_TTL_MS) {
    cache.delete(key);
    return undefined;
  }

  return entry.type === type ? entry.content : undefined;
}

/**
 * Apenas para testes: limpa o cache.
 */
export function __clearViewOnceCache() {
  cache.clear();
}
