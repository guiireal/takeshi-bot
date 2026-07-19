import { delay } from "baileys";
import { PREFIX } from "../../../config.js";
import { sendRichCodeMessage } from "../../../utils/codeMessage.js";

export default {
  name: "enviar-botoes",
  description: "Exemplo de como enviar mensagens com botões",
  commands: ["enviar-botoes", "enviar-botao", "botoes-exemplo"],
  usage: `${PREFIX}enviar-botoes`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    socket,
    remoteJid,
    webMessage,
    sendReply,
    sendReact,
    prefix,
  }) => {
    await sendReact("🔘");

    const triggerCommand = (parametro) =>
      `${prefix || PREFIX}exemplo-gatilho ${parametro}`;

    await delay(2000);

    await sendReply(`Vou enviar exemplos de mensagens com botões
      
⚠️ Atenção: não funciona no WhatsApp Business!`);

    await delay(3000);

    await socket.sendMessage(remoteJid, {
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

    await socket.sendMessage(remoteJid, {
      text: "Exemplo com botões interativos",
      footer: "Resposta rápida, link, chamada e cópia",
      interactiveButtons: [
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: "Resposta rápida",
            id: triggerCommand("resposta-rapida"),
          }),
        },
        {
          name: "cta_url",
          buttonParamsJson: JSON.stringify({
            display_text: "Abrir site",
            url: "https://github.com/guiireal",
          }),
        },
        {
          name: "cta_call",
          buttonParamsJson: JSON.stringify({
            display_text: "Ligar",
            phone_number: "+5511999999999",
          }),
        },
        {
          name: "cta_copy",
          buttonParamsJson: JSON.stringify({
            display_text: "Copiar código",
            copy_code: "TAKESHI2026",
          }),
        },
      ],
      viewOnce: true,
    });

    await delay(3000);

    await socket.sendMessage(remoteJid, {
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

    await sendRichCodeMessage(socket, remoteJid, {
      title: "📋 *Como usar mensagens com botões:*",
      language: "javascript",
      code: `await socket.sendMessage(remoteJid, {
  text: 'Escolha uma opção',
  footer: 'Rodapé',
  interactiveButtons: [
    {
      name: 'cta_url',
      buttonParamsJson: JSON.stringify({
        display_text: 'Abrir site',
        url: 'https://github.com/guiireal'
      })
    }
  ],
  viewOnce: true
});`,
      footer:
        "\n💡 *Dicas:*\n" +
        "• `buttons` cria botões simples usando native flow por padrão\n" +
        "• `useLegacyButtons: true` força o formato antigo `buttonsMessage`\n" +
        "• `interactiveButtons` aceita `quick_reply`, `cta_url`, `cta_call`, `cta_copy`, `single_select`, entre outros\n" +
        "• `templateButtons` não é mais renderizado pelo WhatsApp em números comuns, use `interactiveButtons`\n" +
        "⚠️ Importante: a baileys do Takeshi foi modificada para suportar esses formatos!",
      quoted: webMessage,
    });
  },
};
