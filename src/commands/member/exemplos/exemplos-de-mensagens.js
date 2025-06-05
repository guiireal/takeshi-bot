const { PREFIX } = require(`${BASE_DIR}/config`);
const { delay } = require("baileys");

module.exports = {
  name: "exemplos-de-mensagens",
  description:
    "Lista todos os exemplos disponíveis de envio de mensagens para desenvolvedores",
  commands: [
    "exemplos-de-mensagens",
    "exemplos",
    "help-exemplos",
    "exemplo-de-mensagem",
    "exemplo-de-mensagens",
    "enviar-exemplos",
    "enviar-exemplo",
  ],
  usage: `${PREFIX}exemplos-de-mensagens`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendReact }) => {
    await sendReact("📚");

    await delay(2000);

    await sendReply(
      "*📚 EXEMPLOS DISPONÍVEIS*\n\n" +
        "Use os comandos abaixo para ver exemplos práticos de como usar os meus comandos:"
    );

    await delay(2000);

    await sendReply(
      "*🔊 ÁUDIO:*\n" +
        `• \`${PREFIX}enviar-audio-de-arquivo\` - Enviar áudio de arquivo local\n` +
        `• \`${PREFIX}enviar-audio-de-url\` - Enviar áudio de URL\n` +
        `• \`${PREFIX}enviar-audio-de-buffer\` - Enviar áudio de buffer`
    );

    await delay(2000);

    await sendReply(
      "*🖼️ IMAGEM:*\n" +
        `• \`${PREFIX}enviar-imagem-de-arquivo\` - Enviar imagem de arquivo local\n` +
        `• \`${PREFIX}enviar-imagem-de-url\` - Enviar imagem de URL\n` +
        `• \`${PREFIX}enviar-imagem-de-buffer\` - Enviar imagem de buffer`
    );

    await delay(2000);

    await sendReply(
      "*🎬 VÍDEO:*\n" +
        `• \`${PREFIX}enviar-video-de-arquivo\` - Enviar vídeo de arquivo local\n` +
        `• \`${PREFIX}enviar-video-de-url\` - Enviar vídeo de URL\n` +
        `• \`${PREFIX}enviar-video-de-buffer\` - Enviar vídeo de buffer`
    );

    await delay(2000);

    await sendReply(
      "*🎞️ GIF:*\n" +
        `• \`${PREFIX}enviar-gif-de-arquivo\` - Enviar GIF de arquivo local\n` +
        `• \`${PREFIX}enviar-gif-de-url\` - Enviar GIF de URL\n` +
        `• \`${PREFIX}enviar-gif-de-buffer\` - Enviar GIF de buffer`
    );

    await delay(2000);

    await sendReply(
      "*🏷️ STICKER:*\n" +
        `• \`${PREFIX}enviar-sticker-de-arquivo\` - Enviar sticker de arquivo local\n` +
        `• \`${PREFIX}enviar-sticker-de-url\` - Enviar sticker de URL\n` +
        `• \`${PREFIX}enviar-sticker-de-buffer\` - Enviar sticker de buffer`
    );

    await delay(2000);

    await sendReply(
      "*📊 ENQUETE:*\n" +
        `• \`${PREFIX}enviar-enquete\` - Enviar enquetes/votações (escolha única ou múltipla)`
    );

    await delay(2000);

    await sendReply(
      "*📄 DOCUMENTO:*\n" +
        `• \`${PREFIX}enviar-documento-de-arquivo\` - Enviar documento de arquivo local\n` +
        `• \`${PREFIX}enviar-documento-de-url\` - Enviar documento de URL\n` +
        `• \`${PREFIX}enviar-documento-de-buffer\` - Enviar documento de buffer`
    );

    await delay(2000);

    await sendReply(
      "*💬 TEXTO E RESPOSTAS:*\n" +
        `• \`${PREFIX}enviar-texto\` - Enviar texto (com/sem menção)\n` +
        `• \`${PREFIX}enviar-resposta\` - Responder mensagens (com/sem menção)\n` +
        `• \`${PREFIX}enviar-reacoes\` - Enviar reações (emojis)`
    );

    await delay(2000);

    await sendReply(
      "*📊 DADOS E METADADOS:*\n" +
        `• \`${PREFIX}obter-dados-grupo\` - Obter dados do grupo (nome, dono, participantes)\n` +
        `• \`${PREFIX}obter-metadados-mensagem\` - Obter metadados da mensagem\n` +
        `• \`${PREFIX}funcoes-grupo\` - Funções utilitárias de grupo (demonstração)\n` +
        `• \`${PREFIX}raw-message\` - Obter dados brutos da mensagem`
    );

    await delay(2000);

    await sendReply(
      "*🎯 COMO USAR:*\n\n" +
        "1️⃣ Execute qualquer comando da lista acima\n" +
        "2️⃣ Observe o comportamento prático\n" +
        "3️⃣ Veja o código fonte em `/src/commands/member/exemplos/`\n" +
        "4️⃣ Use como base para seus próprios comandos\n\n" +
        "*💡 Dica:* Todos os exemplos incluem explicações detalhadas e casos de uso!"
    );

    await delay(2000);

    await sendReply(
      "*📝 FUNÇÕES DISPONÍVEIS:*\n\n" +
        "Veja o arquivo `@types/index.d.ts` para documentação completa de todas as funções disponíveis com exemplos de código!"
    );
  },
};
