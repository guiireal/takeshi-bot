/**
 * Cache em memória das referências de mídia de visualização única.
 *
 * O WhatsApp remove mediaKey/directPath da mídia quando ela é citada
 * (contextInfo.quotedMessage só traz `viewOnce: true`). A única chance de
 * ler essas chaves é quando a mensagem original chega, então guardamos a
 * referência (não o arquivo) por um tempo curto, presa ao chat de origem.
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
 * @param {{ chatJid?: string, id?: string, type: string, media?: object }} params
 * type é a chave do proto, ex.: "imageMessage".
 */
export function rememberViewOnceMedia({ chatJid, id, type, media }) {
  if (!chatJid || !id || !media?.mediaKey) {
    return;
  }

  cache.set(keyOf(chatJid, id), { type, media, ts: Date.now() });
  prune();
}

/**
 * Só devolve a mídia se o id foi visto NESTE chat e é do tipo pedido: o
 * stanzaId do quote é fornecido pelo cliente e pode apontar para outro grupo.
 */
export function getViewOnceMedia({ chatJid, id, type }) {
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

  return entry.type === type ? entry.media : undefined;
}

/**
 * Apenas para testes: limpa o cache.
 */
export function __clearViewOnceCache() {
  cache.clear();
}
