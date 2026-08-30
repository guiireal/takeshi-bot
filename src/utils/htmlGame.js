/**
 * Envio de jogos HTML Rich Response (arcade dentro do WhatsApp) via zapo-js.
 *
 * @author Dev Gui
 */
import { randomUUID } from "node:crypto";

export const HTML_GAME_PRIMITIVE = "GenAIaeacdsnwHtmlPrimitive";
export const HTML_GAME_TRUSTED_SOURCES = ["nixel.dev"];

function normalizeHtml(html) {
  if (typeof html !== "string" || !html.trim()) {
    throw new TypeError("O HTML do jogo precisa ser uma string não vazia.");
  }
  return html.trim();
}

export function buildHtmlGameMessage(
  html,
  { submessageText = "TAKESHI HTML GAME" } = {},
) {
  const payload = normalizeHtml(html);
  const unifiedResponse = {
    response_id: randomUUID(),
    sections: [
      {
        view_model: {
          primitive: {
            __typename: HTML_GAME_PRIMITIVE,
            payload,
            trusted_sources: [...HTML_GAME_TRUSTED_SOURCES],
          },
          __typename: "GenAISingleLayoutViewModel",
        },
      },
    ],
  };

  return {
    botForwardedMessage: {
      message: {
        richResponseMessage: {
          submessages: [
            {
              messageType: 2,
              messageText: String(submessageText || "TAKESHI HTML GAME"),
            },
          ],
          messageType: 1,
          unifiedResponse: {
            data: Buffer.from(JSON.stringify(unifiedResponse), "utf8"),
          },
          contextInfo: {
            mentionedJid: [],
            groupMentions: [],
            statusAttributions: [],
            forwardingScore: 1,
            isForwarded: true,
            forwardedAiBotMessageInfo: {
              botJid: "867051314767696@bot",
            },
            forwardOrigin: 4,
          },
        },
      },
    },
  };
}

/**
 * Envia um jogo HTML Rich Response para o jid informado.
 *
 * @param {WaSocketAdapter} socket Socket de compatibilidade (services/wa.js)
 * @param {string} jid ID do grupo/usuário que vai receber o jogo
 * @param {string} html HTML completo do jogo
 * @param {{ submessageText?: string }} [options]
 */
export async function sendHtmlGame(socket, jid, html, options = {}) {
  return socket.relayMessage(jid, buildHtmlGameMessage(html, options));
}
