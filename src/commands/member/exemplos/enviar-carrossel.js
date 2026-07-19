import { delay } from "baileys";
import { PREFIX } from "../../../config.js";

export default {
  name: "enviar-carrossel",
  description: "Exemplo de como enviar mensagens em formato carrossel (cards)",
  commands: ["enviar-carrossel"],
  usage: `${PREFIX}enviar-carrossel`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ socket, remoteJid, sendReply, sendReact }) => {
    await sendReact("🎠");

    await delay(2000);

    await sendReply(`Vou enviar um exemplo de mensagem em carrossel (cards)
  
⚠️ Atenção: não funciona no WhatsApp Business!`);

    await delay(3000);

    await socket.sendMessage(remoteJid, {
      text: "🎨 Galeria de Exemplos",
      footer: "Deslize para ver todos os cards →",
      cards: [
        {
          title: "🖼️ Card 1: Imagem de Exemplo",
          image: {
            url: "https://api.spiderx.com.br/storage/samples/sample-image.jpg",
          },
          caption: "Esta é a primeira imagem do carrossel",
        },
        {
          title: "📸 Card 2: Outra Imagem",
          image: {
            url: "https://api.spiderx.com.br/assets/images/logo.png",
          },
          caption: "Segunda imagem com descrição diferente",
        },
        {
          title: "🎭 Card 3: Terceira Opção",
          image: {
            url: "https://api.spiderx.com.br/storage/samples/sample-image.jpg",
          },
          caption: "Outro exemplo de card no carrossel",
        },
      ],
      viewOnce: true,
    });

    await delay(3000);

    await sendReply(`📋 *Como usar mensagens carrossel:*

\`\`\`
await socket.sendMessage(remoteJid, {
  text: 'Título principal',
  footer: 'Rodapé da mensagem',
  cards: [
    {
      title: 'Título do card',
      image: { url: 'URL da imagem' },
      caption: 'Descrição do card'
    }
  ],
  viewOnce: true
});
\`\`\`

💡 *Dicas:*
• Você pode adicionar quantos cards quiser
• \`viewOnce: true\` é obrigatório
• Cada card precisa de \`title\`, \`image\` e \`caption\`
⚠️ Importante: a baileys do Takeshi foi modificada para suportar mensagens em carrossel!`);
  },
};
