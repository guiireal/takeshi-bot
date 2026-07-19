import { delay } from "baileys";
import { PREFIX } from "../../../config.js";

export default {
  name: "enviar-lista",
  description: "Exemplo de como enviar mensagens em formato de lista",
  commands: ["enviar-lista", "lista-exemplo", "enviar-list"],
  usage: `${PREFIX}enviar-lista`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    socket,
    remoteJid,
    sendReply,
    sendReact,
    prefix,
  }) => {
    await sendReact("📋");

    const triggerCommand = (parametro) =>
      `${prefix || PREFIX}exemplo-gatilho ${parametro}`;

    await delay(2000);

    await sendReply(`Vou enviar um exemplo de mensagem em lista
      
⚠️ Atenção: não funciona no WhatsApp Business!`);

    await delay(3000);

    await socket.sendMessage(remoteJid, {
      text: "Escolha uma categoria para ver exemplos",
      title: "Menu de exemplos",
      footer: "Lista de opções",
      buttonText: "Abrir lista",
      sections: [
        {
          title: "Mídias",
          rows: [
            {
              title: "Imagem",
              description: "Exemplos de envio de imagens",
              rowId: triggerCommand("imagem"),
            },
            {
              title: "Vídeo",
              description: "Exemplos de envio de vídeos",
              rowId: triggerCommand("video"),
            },
            {
              title: "Áudio",
              description: "Exemplos de envio de áudios",
              rowId: triggerCommand("audio"),
            },
          ],
        },
        {
          title: "Interação",
          rows: [
            {
              title: "Botões",
              description: "Exemplos com botões",
              rowId: triggerCommand("botoes"),
            },
            {
              title: "Carrossel",
              description: "Exemplos em formato de cards",
              rowId: triggerCommand("carrossel"),
            },
          ],
        },
      ],
      viewOnce: true,
    });

    await delay(3000);

    await sendReply(`📋 *Como usar mensagens em lista:*

\`\`\`
await socket.sendMessage(remoteJid, {
  text: 'Descrição da lista',
  title: 'Título da lista',
  footer: 'Rodapé',
  buttonText: 'Abrir lista',
  viewOnce: true,
  sections: [
    {
      title: 'Seção',
      rows: [
        {
          title: 'Opção 1',
          description: 'Descrição da opção',
          rowId: '${prefix || PREFIX}exemplo-gatilho imagem'
        }
      ]
    }
  ]
});
\`\`\`

💡 *Dicas:*
• \`buttonText\` é obrigatório para abrir a lista
• \`sections\` cria uma lista usando native flow por padrão
• \`useLegacyList: true\` força o formato antigo \`listMessage\`
• Cada seção pode ter várias linhas
• Use \`rowId\` para identificar a opção escolhida
⚠️ Importante: a baileys do Takeshi foi modificada para suportar listas!`);
  },
};
