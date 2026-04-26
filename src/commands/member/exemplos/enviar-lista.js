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
  handle: async ({ socket, remoteJid, sendReply, sendReact, prefix }) => {
    await sendReact("📋");

    const triggerCommand = (parametro) =>
      `${prefix || PREFIX}exemplo-gatilho ${parametro}`;

    const sendExample = async (label, content) => {
      try {
        await socket.sendMessage(remoteJid, content);
      } catch (error) {
        await sendReply(
          `⚠️ Não consegui enviar ${label}: ${error.message}`,
        );
      }
    };

    await delay(2000);

    await sendReply("Vou enviar um exemplo de mensagem em lista");

    await delay(3000);

    await sendExample("lista", {
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

    await sendReply(
      "📋 *Como usar mensagens em lista:*\n\n" +
        "```javascript\n" +
        "await socket.sendMessage(remoteJid, {\n" +
        "  text: 'Descrição da lista',\n" +
        "  title: 'Título da lista',\n" +
        "  footer: 'Rodapé',\n" +
        "  buttonText: 'Abrir lista',\n" +
        "  viewOnce: true,\n" +
        "  sections: [\n" +
        "    {\n" +
        "      title: 'Seção',\n" +
        "      rows: [\n" +
        "        {\n" +
        "          title: 'Opção 1',\n" +
        "          description: 'Descrição da opção',\n" +
        `          rowId: '${prefix || PREFIX}exemplo-gatilho imagem'\n` +
        "        }\n" +
        "      ]\n" +
        "    }\n" +
        "  ]\n" +
        "});\n" +
        "```\n\n" +
        "💡 *Dicas:*\n" +
        "• `buttonText` é obrigatório para abrir a lista\n" +
        "• `sections` cria uma lista usando native flow por padrão\n" +
        "• `useLegacyList: true` força o formato antigo `listMessage`\n" +
        "• Cada seção pode ter várias linhas\n" +
        "• Use `rowId` para identificar a opção escolhida\n" +
        "⚠️ Importante: a baileys do Takeshi foi modificada para suportar listas!",
    );
  },
};
