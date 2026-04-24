import { PREFIX, BOT_EMOJI } from "../../config.js";

export default {
  name: "dashboard",
  description: "Abre o painel de monitoramento do bot",
  commands: ["dashboard", "painel", "panel", "stats", "estatísticas"],
  usage: `${PREFIX}dashboard`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendReact }) => {
    await sendReact(BOT_EMOJI);

    await sendReply(`🎛️ *Painel de Monitoramento do Takeshi Bot*

Acesse seu dashboard em:
http://localhost:3000

Se você estiver usando em uma VPS/Host, substitua "localhost" pelo IP do seu servidor.

Exemplo: http://SEU_IP:3000

⚠️ *Nota:* O painel é acessível apenas localmente. Para acesso remoto, configure um proxy reverso com Nginx ou similar.

📊 No painel você pode visualizar:
- Status da conexão
- Uptime do bot
- Quantidade de comandos
- Quantidade de grupos
- Usuários silenciados
- Auto-responders ativos
- Informações do sistema`);
  },
};
