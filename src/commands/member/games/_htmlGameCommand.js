/**
 * Fábrica de comandos de jogo HTML Rich Response.
 *
 * @author Dev Gui
 */
import { errorLog } from "../../../utils/logger.js";
import { sendHtmlGame } from "../../../utils/htmlGame.js";

export const ARCADE_BASE_CSS = `
*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;box-sizing:border-box}
body{margin:0;background:transparent;font-family:Arial,sans-serif;color:#e8edf0;touch-action:manipulation}
.wrap{width:100%;max-width:620px;margin:auto;padding:16px}
.card{background:rgba(29,40,47,.97);border:1px solid rgba(255,255,255,.13);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)}
.head{padding:12px 20px;border-bottom:1px solid rgba(255,255,255,.1);display:flex;justify-content:space-between;align-items:center;gap:12px}
.brand{font-size:9px;letter-spacing:1.5px;color:rgba(255,255,255,.42)}
.title{font-size:15px;font-weight:bold;color:#fff}
.stats{display:flex;gap:15px;text-align:right}
.value{font:700 16px monospace;color:#fff}
.label{font-size:8px;color:rgba(255,255,255,.38);letter-spacing:1px}
.main{padding:16px}
.board{position:relative;background:rgba(4,9,12,.35);border:1px solid rgba(255,255,255,.09);border-radius:12px;overflow:hidden}
.board canvas{display:block;width:100%;height:auto}
.controls{display:flex;gap:8px;margin-top:10px;justify-content:center}
.button{min-height:45px;border:1px solid rgba(255,255,255,.15);border-radius:9px;color:#fff;font-weight:bold;font-size:12px;background:rgba(255,255,255,.07);padding:0 16px}
.primary{background:linear-gradient(135deg,rgba(124,84,227,.75),rgba(58,125,191,.7));border-color:rgba(158,133,255,.65)}
.status{text-align:center;font:10px monospace;color:rgba(255,255,255,.45);margin-top:10px;min-height:12px}
.overlay{position:absolute;inset:0;background:rgba(8,14,18,.82);display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;z-index:5}
.overlay.hidden{display:none}
.overlay-title{font-size:25px;font-weight:bold;letter-spacing:1px}
.overlay-sub{font-size:11px;color:rgba(255,255,255,.52);margin-top:8px}
`;

/**
 * @param {{
 *  name: string,
 *  commands: string[],
 *  description: string,
 *  usage: string,
 *  html: string,
 *  submessageText?: string,
 *  displayName: string,
 * }} params
 */
export function createHtmlGameCommand({
  name,
  commands,
  description,
  usage,
  html,
  submessageText,
  displayName,
}) {
  return {
    name,
    description,
    commands,
    usage,
    /**
     * @param {CommandHandleProps} props
     */
    handle: async ({ socket, remoteJid, sendSuccessReact, sendErrorReply }) => {
      try {
        await sendHtmlGame(socket, remoteJid, html, { submessageText });
        await sendSuccessReact();
      } catch (error) {
        errorLog(`[${name.toUpperCase()}] Erro ao enviar o jogo HTML: ${error.message}`);
        await sendErrorReply(
          `Não consegui abrir *${displayName}* neste WhatsApp. Atualize o aplicativo e tente novamente.`,
        );
      }
    },
  };
}
