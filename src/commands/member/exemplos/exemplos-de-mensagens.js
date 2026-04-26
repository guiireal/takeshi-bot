import { delay } from "baileys";
import { PREFIX } from "../../../config.js";

export default {
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
   */
  handle: async ({ sendReply, sendReact, prefix }) => {
    await sendReact("📚");

    await delay(2000);

    await sendReply(
      "*📚 EXEMPLOS DISPONÍVEIS*\n\n" +
        "Use os comandos abaixo para ver exemplos práticos de como usar os meus comandos:",
    );

    await delay(2000);

    await sendReply(
      "*🔊 ÁUDIO*\n" +
        `• \`${prefix}enviar-audio-de-arquivo\` - Enviar áudio de arquivo local\n` +
        `• \`${prefix}enviar-audio-de-url\` - Enviar áudio de URL\n` +
        `• \`${prefix}enviar-audio-de-buffer\` - Enviar áudio de buffer`,
    );

    await delay(2000);

    await sendReply(
      "*🖼️ IMAGEM*\n" +
        `• \`${prefix}enviar-imagem-de-arquivo\` - Enviar imagem de arquivo local\n` +
        `• \`${prefix}enviar-imagem-de-url\` - Enviar imagem de URL\n` +
        `• \`${prefix}enviar-imagem-de-buffer\` - Enviar imagem de buffer`,
    );

    await delay(2000);

    await sendReply(
      "*🎬 VÍDEO*\n" +
        `• \`${prefix}enviar-video-de-arquivo\` - Enviar vídeo de arquivo local\n` +
        `• \`${prefix}enviar-video-de-url\` - Enviar vídeo de URL\n` +
        `• \`${prefix}enviar-video-de-buffer\` - Enviar vídeo de buffer`,
    );

    await delay(2000);

    await sendReply(
      "*🎞️ GIF*\n" +
        `• \`${prefix}enviar-gif-de-arquivo\` - Enviar GIF de arquivo local\n` +
        `• \`${prefix}enviar-gif-de-url\` - Enviar GIF de URL\n` +
        `• \`${prefix}enviar-gif-de-buffer\` - Enviar GIF de buffer`,
    );

    await delay(2000);

    await sendReply(
      "*🏷️ STICKER*\n" +
        `• \`${prefix}enviar-sticker-de-arquivo\` - Enviar sticker de arquivo local\n` +
        `• \`${prefix}enviar-sticker-de-url\` - Enviar sticker de URL\n` +
        `• \`${prefix}enviar-sticker-de-buffer\` - Enviar sticker de buffer`,
    );

    await delay(2000);

    await sendReply(
      "*📊 ENQUETE*\n" +
        `• \`${prefix}enviar-enquete\` - Enviar enquetes/votações (escolha única ou múltipla)`,
    );

    await delay(2000);

    await sendReply(
      "*📍 LOCALIZAÇÃO*\n" +
        `• \`${prefix}enviar-localizacao\` - Enviar localização`,
    );

    await delay(2000);

    await sendReply(
      "*📲 CONTATO*\n" + `• \`${prefix}enviar-contato\` - Enviar contato`,
    );

    await delay(2000);

    await sendReply(
      "*📄 DOCUMENTO*\n" +
        `• \`${prefix}enviar-documento-de-arquivo\` - Enviar documento de arquivo local\n` +
        `• \`${prefix}enviar-documento-de-url\` - Enviar documento de URL\n` +
        `• \`${prefix}enviar-documento-de-buffer\` - Enviar documento de buffer`,
    );

    await delay(2000);

    await sendReply(
      "*💬 TEXTO E RESPOSTAS*\n" +
        `• \`${prefix}enviar-texto\` - Enviar texto (com/sem menção)\n` +
        `• \`${prefix}enviar-resposta\` - Responder mensagens (com/sem menção)\n` +
        `• \`${prefix}enviar-reacoes\` - Enviar reações (emojis)\n` +
        `• \`${prefix}enviar-mensagem-editada\` - Enviar mensagens editadas`,
    );

    await delay(2000);

    await sendReply(
      "*📊 DADOS E METADADOS*\n" +
        `• \`${prefix}obter-dados-grupo\` - Obter dados do grupo (nome, dono, participantes)\n` +
        `• \`${prefix}obter-metadados-mensagem\` - Obter metadados da mensagem\n` +
        `• \`${prefix}funcoes-grupo\` - Funções utilitárias de grupo (demonstração)\n` +
        `• \`${prefix}raw-message\` - Obter dados brutos da mensagem`,
    );

    await delay(2000);

    await sendReply(
      "*🎠 CARROSSEL (CARDS)*\n" +
        `• \`${prefix}enviar-carrossel\` - Enviar mensagem em formato carrossel (cards)`,
    );

    await delay(2000);

    await sendReply(
      "*🔘 BOTÕES E LISTAS*\n" +
        `• \`${prefix}enviar-botoes\` - Enviar mensagens com botões simples, templates e interativos\n` +
        `• \`${prefix}enviar-lista\` - Enviar mensagem em formato de lista\n` +
        `• \`${prefix}exemplo-gatilho <parâmetro>\` - Receber o clique de botões e listas`,
    );

    await delay(2000);

    await sendReply(
      "*🧩 RICH RESPONSE*\n" +
        `• \`${prefix}enviar-texto-colorido\` - Enviar texto destacado/colorido em rich response\n` +
        `• \`${prefix}enviar-codigo\` - Enviar bloco de código em rich response\n` +
        `• \`${prefix}enviar-tabela\` - Enviar tabela em rich response\n` +
        `• \`${prefix}enviar-latex\` - Enviar fórmula LaTeX em rich response`,
    );

    await delay(2000);

    await sendReply(
      "*🎯 COMO USAR*\n\n" +
        "1️⃣ Execute qualquer comando da lista acima\n" +
        "2️⃣ Observe o comportamento prático\n" +
        "3️⃣ Veja o código fonte em `/src/commands/member/exemplos/`\n" +
        "4️⃣ Use como base para seus próprios comandos\n\n" +
        "*💡 Dica:* Todos os exemplos incluem explicações detalhadas e casos de uso!",
    );

    await delay(2000);

    await sendReply(
      "*📝 FUNÇÕES DISPONÍVEIS*\n\n" +
        "Veja o arquivo `@types/index.d.ts` para documentação completa de todas as funções disponíveis com exemplos de código!",
    );
  },
};
