/**
 * Este é um modelo de comando.
 * Copie e cole este arquivo para criar um novo comando em uma das pastas: admin, member ou owner
 * Você deve renomeá-lo para ficar de fácil identificação na pasta destino.
 *
 * Pasta owner: Comandos que só podem ser executados pelo dono do grupo/bot
 * Pasta admin: Comandos que só podem ser executados por administradores do grupo
 * Pasta member: Comandos que podem ser executados por qualquer membro do grupo
 *
 * Funções e variáveis que podem ser extraídas do handle em "handle: async ({ aqui })"
 * Cuidado, respeite letras maiúsculas e minúsculas!
 *
 * Variáveis:
 *
 * args           => Argumentos passados junto com o comando como um array: ["arg1", "arg2"]
 * commandName    => Nome do comando
 * fullArgs       => Argumentos passados junto com o comando como string só: "arg1 arg2"
 * fullMessage    => Mensagem inteira incluindo o comando
 * isImage        => Se a mensagem é uma imagem
 * isReply        => Se a mensagem é uma resposta
 * isSticker      => Se a mensagem é um sticker
 * isVideo        => Se a mensagem é um vídeo
 * prefix         => Prefixo do bot
 * remoteJid      => ID do grupo/usuário que está recebendo a msg
 * replyJid       => ID da mensagem que está sendo respondida
 * socket         => Socket do baileys
 * userJid        => ID do usuário que está mandando a msg
 * webMessageInfo => Informações da mensagem
 *
 * Funções:
 *
 * downloadImage()
 * => Download de imagem
 *
 * downloadSticker()
 * => Download de sticker
 *
 * downloadVideo()
 * => Download de vídeo
 *
 * sendAudioFromURL("https://teste.com/audio.mp3")
 * => Enviar áudio de uma URL
 *
 * sendErrorReact()
 * => Enviar reação de erro
 *
 * sendErrorReply("texto")
 * => Enviar mensagem de erro como resposta
 *
 * sendImageFromFile("./path/to/image.png")
 * => Enviar imagem de um arquivo
 *
 * sendImageFromURL("https://teste.com/imagem.png")
 * => Enviar imagem de uma URL
 *
 * sendReact("emoji")
 * => Enviar reação
 *
 * sendReply("texto")
 * => Enviar mensagem de resposta
 *
 * sendStickerFromFile("./path/to/sticker.webp")
 * => Enviar sticker de um arquivo
 *
 * sendStickerFromURL("https://teste.com/sticker.webp")
 * => Enviar sticker de uma URL
 *
 * sendSuccessReact()
 * => Enviar reação de sucesso
 *
 * sendSuccessReply()
 * => Enviar mensagem de sucesso como resposta
 *
 * sendText("texto", mentions)
 * => Enviar mensagem de texto, opcionalmente mencionando usuários (mentions)
 *
 * sendVideoFromURL("https://teste.com/video.mp4")
 * => Enviar vídeo de uma URL
 *
 * sendWaitReact()
 * => Enviar reação de espera
 *
 * sendWaitReply()
 * => Enviar mensagem de espera como resposta
 *
 * sendWarningReact()
 * => Enviar reação de aviso
 *
 * sendWarningReply("texto")
 * => Enviar mensagem de aviso como resposta
 */
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "comando",
  description: "Descrição do comando",
  commands: ["comando1", "comando2"],
  usage: `${PREFIX}comando`,
  handle: async ({}) => {
    // código do comando
  },
};
