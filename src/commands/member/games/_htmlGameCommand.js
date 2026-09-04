/**
 * Fábrica de comandos de jogo HTML Rich Response.
 *
 * @author Dev Gui
 */
import { errorLog } from "../../../utils/logger.js";
import { sendHtmlGame } from "../../../utils/htmlGame.js";

export const ARCADE_BASE_CSS = `
:root{
  --accent-a:#8b6cf0;
  --accent-b:#4fa8e0;
  --ink:#f2f5f7;
  --ink-dim:rgba(242,245,247,.55);
  --ink-faint:rgba(242,245,247,.4);
}
*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;box-sizing:border-box}
body{margin:0;background:transparent;font-family:-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:var(--ink);touch-action:manipulation}
.wrap{width:100%;max-width:620px;margin:auto;padding:16px}
.card{background:linear-gradient(180deg,rgba(34,45,53,.97),rgba(24,33,40,.97));border:1px solid rgba(255,255,255,.1);border-radius:18px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,.4)}
.head{padding:14px 20px;border-bottom:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.15);display:flex;justify-content:space-between;align-items:center;gap:12px}
.brand{font-size:9px;font-weight:700;letter-spacing:2px;color:var(--accent-b);opacity:.85}
.title{font-size:16px;font-weight:800;color:#fff;letter-spacing:.3px;margin-top:2px}
.stats{display:flex;gap:16px;text-align:right}
.value{font:800 17px/1 ui-monospace,SFMono-Regular,Menlo,monospace;color:#fff;font-variant-numeric:tabular-nums}
.label{font-size:8px;font-weight:700;color:var(--ink-faint);letter-spacing:1.2px;margin-bottom:3px}
.main{padding:16px}
.board{position:relative;background:radial-gradient(circle at 50% 0%,rgba(255,255,255,.05),rgba(0,0,0,0) 60%),rgba(4,9,12,.4);border:1px solid rgba(255,255,255,.08);border-radius:14px;overflow:hidden;box-shadow:inset 0 0 24px rgba(0,0,0,.35)}
.board canvas{display:block;width:100%;height:auto}
.controls{display:flex;gap:8px;margin-top:12px;justify-content:center}
.button{min-height:46px;border:1px solid rgba(255,255,255,.14);border-radius:10px;color:#fff;font-weight:700;font-size:12px;letter-spacing:.3px;background:rgba(255,255,255,.06);padding:0 16px;transition:transform .08s ease,filter .08s ease}
.button:active{transform:scale(.94);filter:brightness(1.15)}
.primary{background:linear-gradient(135deg,var(--accent-a),var(--accent-b));border-color:rgba(255,255,255,.25);box-shadow:0 4px 16px rgba(139,108,240,.35)}
.status{text-align:center;font:10px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--ink-faint);letter-spacing:.3px;margin-top:12px;min-height:12px}
.overlay{position:absolute;inset:0;background:rgba(10,15,19,.88);backdrop-filter:blur(2px);display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;z-index:5;animation:fade-in .18s ease}
.overlay.hidden{display:none}
.overlay-title{font-size:24px;font-weight:800;letter-spacing:.5px;background:linear-gradient(135deg,#fff,var(--accent-b));-webkit-background-clip:text;background-clip:text;color:transparent}
.overlay-sub{font-size:11px;color:var(--ink-dim);letter-spacing:.2px;margin-top:8px;max-width:280px}
@keyframes fade-in{from{opacity:0}to{opacity:1}}
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
