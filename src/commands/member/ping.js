/**
 * Melhorado por: Mkg
 *
 * @author Dev Gui
 */
import { PREFIX } from "../../config.js";

export default {
  name: "ping",
  description:
    "Verificar se o bot está online, o tempo de resposta e o tempo de atividade.",
  commands: ["ping", "pong"],
  usage: `${PREFIX}ping`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendReact, startProcess, fullMessage }) => {
    const response = fullMessage.slice(1).startsWith("ping")
      ? "🏓 Pong!"
      : "🏓 Ping!";

    await sendReact("🏓");

    const uptime = process.uptime();

    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);

    const ping = Date.now() - startProcess;

    await sendReply(`${response}

📶 Velocidade de resposta: ${ping}ms
⏱️ Uptime: ${h}h ${m}m ${s}s`);
  },
};
