import { delay } from "baileys";
import { PREFIX } from "../../../config.js";

export default {
  name: "enviar-botoes",
  description: "Exemplo de como enviar mensagens com botões",
  commands: ["enviar-botoes", "enviar-botao", "botoes-exemplo"],
  usage: `${PREFIX}enviar-botoes`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ socket, remoteJid, sendReply, sendReact, prefix }) => {
    await sendReact("🔘");

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

    await sendReply("Vou enviar exemplos de mensagens com botões");

    await delay(3000);

    await sendExample("botões simples", {
      text: "Exemplo com botões simples",
      footer: "Botões simples",
      buttons: [
        {
          buttonId: triggerCommand("opcao1"),
          buttonText: { displayText: "Opção 1" },
        },
        {
          buttonId: triggerCommand("opcao2"),
          buttonText: { displayText: "Opção 2" },
        },
      ],
      viewOnce: true,
    });

    await delay(3000);

    await sendExample("botões de template", {
      text: "Exemplo com botões de template",
      footer: "Resposta rápida, URL e chamada",
      templateButtons: [
        {
          index: 1,
          quickReplyButton: {
            displayText: "Resposta rápida",
            id: triggerCommand("resposta-rapida"),
          },
        },
        {
          index: 2,
          urlButton: {
            displayText: "Abrir site",
            url: "https://github.com/guiireal",
          },
        },
        {
          index: 3,
          callButton: {
            displayText: "Ligar",
            phoneNumber: "+5511999999999",
          },
        },
      ],
    });

    await delay(3000);

    await sendExample("botões interativos", {
      text: "Exemplo com botões interativos",
      footer: "Botões native flow",
      interactiveButtons: [
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: "Interativo 1",
            id: triggerCommand("interativo1"),
          }),
        },
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: "Interativo 2",
            id: triggerCommand("interativo2"),
          }),
        },
      ],
      viewOnce: true,
    });

    await delay(3000);

    await sendExample("botões legados", {
      text: "Exemplo com botões legados",
      footer: "Compatibilidade com buttonsMessage antigo",
      buttons: [
        {
          buttonId: triggerCommand("legado1"),
          buttonText: { displayText: "Legado 1" },
        },
        {
          buttonId: triggerCommand("legado2"),
          buttonText: { displayText: "Legado 2" },
        },
      ],
      useLegacyButtons: true,
    });

    await delay(3000);

    await sendReply(
      "📋 *Como usar mensagens com botões:*\n\n" +
        "```javascript\n" +
        "await socket.sendMessage(remoteJid, {\n" +
        "  text: 'Escolha uma opção',\n" +
        "  footer: 'Rodapé',\n" +
        "  buttons: [\n" +
        "    {\n" +
        `      buttonId: '${prefix || PREFIX}exemplo-gatilho opcao1',\n` +
        "      buttonText: { displayText: 'Opção 1' }\n" +
        "    }\n" +
        "  ]\n" +
        "});\n" +
        "```\n\n" +
        "💡 *Dicas:*\n" +
        "• `buttons` cria botões simples usando native flow por padrão\n" +
        "• `useLegacyButtons: true` força o formato antigo `buttonsMessage`\n" +
        "• `templateButtons` permite resposta rápida, URL e chamada\n" +
        "• `interactiveButtons` usa native flow e normalmente precisa de `viewOnce: true`\n" +
        "⚠️ Importante: a baileys do Takeshi foi modificada para suportar esses formatos!",
    );
  },
};
