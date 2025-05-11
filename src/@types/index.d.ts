export {};
declare global {
  /** Caminho base do projeto, usado para imports. */
  const BASE_DIR: string;

  /**
   * Propriedades e funções disponíveis no objeto passado para a função handle
   * de cada comando. Você pode acessá-las com desestruturação:
   *
   * ```javascript
   * handle: async ({ args, sendReply, isImage }) => {
   *    // Seu código aqui
   * }
   * ```
   */
  interface CommandHandleProps {
    /**
     * Argumentos passados junto com o comando como um array, o que separa
     * os argumentos são as barras / | ou \
     * Exemplo: ["arg1", "arg2"]
     */
    args: string[];

    /**
     * Nome do comando que foi executado
     */
    commandName: string;

    /**
     * Argumentos passados junto com o comando como string única.
     * Exemplo: "arg1 / arg2"
     */
    fullArgs: string;

    /**
     * Mensagem inteira incluindo o comando.
     */
    fullMessage: string;

    /**
     * Se a mensagem veio de um grupo.
     */
    isGroup: boolean;

    /**
     * Se a mensagem é uma imagem.
     */
    isImage: boolean;

    /**
     * Se a mensagem é uma resposta a outra mensagem.
     */
    isReply: boolean;

    /**
     * Se a mensagem é um sticker.
     */
    isSticker: boolean;

    /**
     * Se a mensagem é um vídeo.
     */
    isVideo: boolean;

    /**
     * Prefixo do bot configurado.
     */
    prefix: string;

    /**
     * ID do grupo/usuário que está recebendo a mensagem.
     */
    remoteJid: string;

    /**
     * ID da mensagem que está sendo respondida.
     */
    replyJid: string;

    /**
     * Socket do baileys para operações avançadas.
     */
    socket: any;

    /**
     * ID do usuário que está mandando a mensagem.
     */
    userJid: string;

    /**
     * Informações detalhadas da mensagem do WhatsApp.
     */
    webMessageInfo: any;

    /**
     * Faz download de uma imagem da mensagem atual.
     * @returns Promise com o buffer da imagem
     */
    downloadImage(): Promise<Buffer>;

    /**
     * Faz download de um sticker da mensagem atual.
     * @returns Promise com o buffer do sticker
     */
    downloadSticker(): Promise<Buffer>;

    /**
     * Faz download de um vídeo da mensagem atual.
     * @returns Promise com o buffer do vídeo
     */
    downloadVideo(): Promise<Buffer>;

    /**
     * Envia um áudio a partir de uma URL.
     *
     * Exemplo:
     * ```javascript
     * await sendAudioFromURL("https://exemplo.com/audio.mp3");
     * ```
     * @param url URL do áudio a ser enviado
     */
    sendAudioFromURL(url: string): Promise<void>;

    /**
     * Envia uma reação de erro (emoji ❌) na mensagem.
     */
    sendErrorReact(): Promise<void>;

    /**
     * Envia uma mensagem de erro como resposta.
     *
     * Exemplo:
     * ```javascript
     * await sendErrorReply("Não foi possível encontrar resultados!");
     * ```
     * @param text Texto da mensagem de erro
     */
    sendErrorReply(text: string): Promise<void>;

    /**
     * Envia um gif a partir de um arquivo local.
     *
     * Exemplo:
     * ```javascript
     * await sendGifFromFile("./assets/alguma-coisa.gif", "Aqui está seu gif @5511920202020", ["5511920202020@s.whatsapp.net"]);
     * ```
     * @param file Caminho do arquivo no servidor
     * @param caption Texto da mensagem
     * @param mentions Array opcional de JIDs de usuários para mencionar.
     */
    sendGifFromFile(
      file: string,
      caption: string,
      mentions?: string[]
    ): Promise<void>;

    /**
     * Envia uma imagem a partir de um arquivo local.
     *
     * Exemplo:
     * ```javascript
     * await sendImageFromFile("./assets/image.png", "Aqui está sua imagem!");
     * ```
     * @param file Caminho do arquivo no servidor
     * @param caption Texto da mensagem
     */
    sendImageFromFile(file: string, caption: string): Promise<void>;

    /**
     * Envia uma imagem a partir de uma URL.
     *
     * Exemplo:
     * ```javascript
     * await sendImageFromURL("https://exemplo.com/imagem.png");
     * ```
     * @param url URL da imagem a ser enviada
     */
    sendImageFromURL(url: string): Promise<void>;

    /**
     * Envia uma reação (emoji) na mensagem.
     *
     * Exemplo:
     * ```javascript
     * await sendReact("👍");
     * ```
     * @param emoji Emoji para reagir
     */
    sendReact(emoji: string): Promise<void>;

    /**
     * Envia uma mensagem como resposta.
     *
     * Exemplo:
     * ```javascript
     * await sendReply("Aqui está sua resposta!");
     * ```
     * @param text Texto da mensagem
     */
    sendReply(text: string): Promise<void>;

    /**
     * Envia um sticker a partir de um arquivo local.
     *
     * Exemplo:
     * ```javascript
     * await sendStickerFromFile("./assets/sticker.webp");
     * ```
     * @param path Caminho do arquivo no servidor
     */
    sendStickerFromFile(path: string): Promise<void>;

    /**
     * Envia um sticker a partir de uma URL.
     *
     * Exemplo:
     * ```javascript
     * await sendStickerFromURL("https://exemplo.com/sticker.webp");
     * ```
     * @param url URL do sticker a ser enviado
     */
    sendStickerFromURL(url: string): Promise<void>;

    /**
     * Envia uma reação de sucesso (emoji ✅) na mensagem
     */
    sendSuccessReact(): Promise<void>;

    /**
     * Envia uma mensagem de sucesso como resposta.
     *
     * Exemplo:
     * ```javascript
     * await sendSuccessReply("Operação concluída com sucesso!");
     * ```
     * @param text Texto da mensagem de sucesso
     */
    sendSuccessReply(text: string): Promise<void>;

    /**
     * Envia uma mensagem de texto, opcionalmente mencionando usuários.
     *
     * Exemplo:
     * ```javascript
     * await sendText("Olá @usuário!", ["123456789@s.whatsapp.net"]);
     * ```
     * @param text Texto da mensagem
     * @param mentions Array opcional de IDs de usuários para mencionar
     */
    sendText(text: string, mentions?: string[]): Promise<void>;

    /**
     * Envia um vídeo a partir de um arquivo local.
     *
     * Exemplo:
     * ```javascript
     * await sendVideoFromFile("./assets/video.mp4", "Aqui está seu vídeo!");
     * ```
     * @param file Caminho do arquivo no servidor
     * @param caption Texto da mensagem
     */
    sendVideoFromFile(file: string, caption: string): Promise<void>;

    /**
     * Envia um vídeo a partir de uma URL.
     *
     * Exemplo:
     * ```javascript
     * await sendVideoFromURL("https://exemplo.com/video.mp4");
     * ```
     * @param url URL do vídeo a ser enviado
     */
    sendVideoFromURL(url: string): Promise<void>;

    /**
     * Envia uma reação de espera (emoji ⏳) na mensagem.
     */
    sendWaitReact(): Promise<void>;

    /**
     * Envia uma mensagem de espera como resposta
     *
     * Exemplo:
     * ```javascript
     * await sendWaitReply("Aguarde um momento, estou processando sua solicitação.");
     * ```
     * @param text Texto da mensagem de espera
     */
    sendWaitReply(text: string): Promise<void>;

    /**
     * Envia uma reação de aviso (emoji ⚠️) na mensagem.
     */
    sendWarningReact(): Promise<void>;

    /**
     * Envia uma mensagem de aviso como resposta.
     *
     * Exemplo:
     * ```javascript
     * await sendWarningReply("Cuidado! Esta operação pode levar alguns minutos.");
     * ```
     * @param text Texto da mensagem de aviso
     */
    sendWarningReply(text: string): Promise<void>;
  }
}

export {};
