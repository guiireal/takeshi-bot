import { GroupMetadata, proto, WAMessage, WASocket } from "baileys";

declare global {
  /**
   * Parâmetros do customMiddleware disponíveis para personalização do bot.
   * Use este middleware para adicionar lógica customizada sem modificar arquivos principais.
   *
   * @example
   * ```javascript
   * export async function customMiddleware({ type, commonFunctions, socket, webMessage }) {
   *   if (type === "message" && commonFunctions) {
   *     const { sendReply, userMessageText } = commonFunctions;
   *     if (userMessageText?.toLowerCase() === "oi") {
   *       await sendReply("Olá! 👋");
   *     }
   *   }
   * }
   * ```
   */
  interface CustomMiddlewareProps {
    /**
     * Socket do Baileys para operações avançadas.
     */
    socket: WASocket;

    /**
     * Mensagem completa do WhatsApp.
     */
    webMessage: WAMessage;

    /**
     * Tipo do evento sendo processado.
     * - "message": Mensagem normal do usuário
     * - "participant": Evento de adicionar/remover participante
     */
    type: "message" | "participant";

    /**
     * Todas as funções comuns do bot (sendReply, args, isImage, etc.).
     * Disponível apenas quando type === "message".
     * Será null quando type === "participant".
     *
     * @see CommandHandleProps para lista completa de funções disponíveis
     */
    commonFunctions: CommandHandleProps | null;

    /**
     * Ação do participante no grupo.
     * Disponível apenas quando type === "participant".
     * - "add": Participante foi adicionado ao grupo
     * - "remove": Participante foi removido/saiu do grupo
     */
    action?: "add" | "remove";

    /**
     * Dados do participante (LID).
     * Disponível apenas quando type === "participant".
     * Exemplo: "12345678901234567890@lid"
     */
    data?: string;
  }

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
     * Se a mensagem é um áudio.
     */
    isAudio: boolean;

    /**
     * Se a mensagem veio de um grupo.
     */
    isGroup: boolean;

    /**
     * Se a mensagem veio de um grupo cujos participantes possuem LID.
     */
    isGroupWithLid: boolean;

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
    replyLid: string;

    /**
     * Texto da mensagem que vem de uma mensagem que você responde em cima.
     */
    replyText: string;

    /**
     * Socket do baileys para operações avançadas.
     */
    socket: WASocket;

    /**
     * Timestamp em que o comando foi iniciado.
     */
    startProcess?: number;

    /**
     * Tipo de comando por cargo, se é "admin", "owner" ou "member".
     */
    type?: string;

    /**
     * ID do usuário que está mandando a mensagem.
     *
     * O WhatsApp está migrando do antigo identificador JID (baseado em número de telefone) para o LID (Local Identifier),
     * que é um identificador privado, aleatório e não revela o número do usuário. O LID reforça a privacidade, pois o número
     * só é compartilhado se o próprio usuário permitir. Veja mais em: https://digisac.com.br/jid-lid-no-whatsapp/
     */
    userLid: string;

    /**
     * Informações detalhadas da mensagem do WhatsApp.
     */
    webMessage: WAMessage;

    /**
     * Exclui uma mensagem de um participante do WhatsApp.
     * Precisa ser administrador do grupo para excluir mensagens de outros participantes.
     *
     *  Exemplo:
     * ```javascript
     * await deleteMessage(webMessage.key);
     * ```
     * @param key Chave de identificação da mensagem a ser deletada.
     */
    deleteMessage(key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
      participant: string;
    }): Promise<void>;

    /**
     * Faz download de um áudio da mensagem atual.
     * @returns Promise com o caminho do áudio
     */
    downloadAudio(webMessage: any, fileName: string): Promise<string>;

    /**
     * Faz download de uma imagem da mensagem atual.
     * @returns Promise com o caminho da imagem
     */
    downloadImage(webMessage: any, fileName: string): Promise<string>;

    /**
     * Faz download de um sticker da mensagem atual.
     * @returns Promise com o caminho do sticker
     */
    downloadSticker(webMessage: any, fileName: string): Promise<string>;

    /**
     * Faz download de um vídeo da mensagem atual.
     * @returns Promise com o caminho do vídeo
     */
    downloadVideo(webMessage: any, fileName: string): Promise<string>;

    /**
     * Envia um áudio a partir de um arquivo.
     *
     * Exemplo:
     * ```javascript
     * import { ASSETS_DIR } from "../../config.js";
     * import path from "node:path";
     *
     * const filePath = path.join(ASSETS_DIR, "samples", "sample-audio.mp3");
     * await sendAudioFromFile(filePath);
     * ```
     * @param filePath Caminho do arquivo
     * @param asVoice Se o áudio deve ser enviado como mensagem de voz (true ou false)
     * @param quoted Se a mensagem deve ser enviada mencionando outra mensagem (true ou false)
     */
    sendAudioFromFile(
      filePath: string,
      asVoice: boolean,
      quoted: boolean,
    ): Promise<proto.WebMessageInfo>;

    /**
     * Envia um áudio a partir de um arquivo.
     *
     * Exemplo:
     * ```javascript
     * import { ASSETS_DIR } from "../../config.js";
     * import { getBuffer } from "../../utils/index.js";
     * import path from "node:path";
     * import fs from "node:fs";
     *
     * const buffer = fs.readFileSync(path.join(ASSETS_DIR, "samples", "sample-audio.mp3"));
     * // ou
     * const buffer = await getBuffer("https://exemplo.com/audio.mp3");
     * await sendAudioFromBuffer(buffer, true, false);
     * ```
     * @param buffer Buffer do arquivo de áudio
     * @param asVoice Se o áudio deve ser enviado como mensagem de voz (true ou false)
     * @param quoted Se a mensagem deve ser enviada mencionando outra mensagem (true ou false)
     */
    sendAudioFromBuffer(
      buffer: Buffer,
      asVoice: boolean,
      quoted: boolean,
    ): Promise<proto.WebMessageInfo>;

    /**
     * Envia um áudio a partir de uma URL.
     *
     * Exemplo:
     * ```javascript
     * await sendAudioFromURL("https://exemplo.com/audio.mp3");
     * ```
     * @param url URL do áudio a ser enviado
     * @param asVoice Se o áudio deve ser enviado como mensagem de voz (true ou false)
     * @param quoted Se a mensagem deve ser enviada mencionando outra mensagem (true ou false)
     */
    sendAudioFromURL(
      url: string,
      asVoice: boolean,
      quoted: boolean,
    ): Promise<proto.WebMessageInfo>;

    /**
     * Envia um contato para o grupo ou usuário.
     *
     * Exemplo:
     * ```javascript
     * await sendContact("5511920202020", "Usuário Exemplo");
     * ```
     * @param phoneNumber Número de telefone do contato (formato internacional, ex: "5511920202020")
     * @param displayName Nome do contato a ser exibido
     */
    sendContact(phoneNumber: string, displayName: string): Promise<void>;

    /**
     * Envia uma mensagem editada como resposta a uma mensagem anterior.
     *
     * Exemplo:
     * ```javascript
     * const response = await sendReply("Mensagem 1", [mentions]);
     * await sendEditedReply("Mensagem editada", response, [mentions]);
     * ```
     * @param text Texto da mensagem
     * @param messageToEdit Mensagem a ser editada
     * @param mentions Array opcional de IDs de usuários para mencionar
     */
    sendEditedReply(
      text: string,
      messageToEdit: proto.WebMessageInfo,
      mentions?: string[],
    ): Promise<proto.WebMessageInfo>;

    /**
     * Envia uma mensagem de texto, opcionalmente mencionando usuários.
     *
     * Exemplo:
     * ```javascript
     * const response = await sendText("Olá @usuário!", ["123456789@s.whatsapp.net"]);
     * await sendEditedText("Mensagem editada", response, ["123456789@s.whatsapp.net"]);
     * ```
     * @param text Texto da mensagem
     * @param messageToEdit Mensagem a ser editada
     * @param mentions Array opcional de IDs de usuários para mencionar
     */
    sendEditedText(
      text: string,
      messageToEdit: proto.WebMessageInfo,
      mentions?: string[],
    ): Promise<proto.WebMessageInfo>;

    /**
     * Envia um gif a partir de um arquivo local.
     *
     * Exemplo:
     * ```javascript
     * await sendGifFromFile("./assets/alguma-coisa.gif", "Aqui está seu gif @5511920202020", ["5511920202020@s.whatsapp.net"]);
     * ```
     * @param file Caminho do arquivo no servidor
     * @param caption Texto da mensagem (opcional)
     * @param mentions Array opcional de JIDs de usuários para mencionar
     * @param quoted Se a mensagem deve ser enviada mencionando outra mensagem (true ou false)
     */
    sendGifFromFile(
      file: string,
      caption?: string,
      mentions?: string[],
      quoted?: boolean,
    ): Promise<proto.WebMessageInfo>;

    /**
     * Envia um gif a partir de uma URL.
     *
     * Exemplo:
     * ```javascript
     * await sendGifFromURL("https://exemplo.com/video.gif", "Aqui está seu gif @5511920202020!", ["5511920202020@s.whatsapp.net"]);
     * ```
     * @param url URL do gif a ser enviado
     * @param caption Texto da mensagem (opcional)
     * @param mentions Array opcional de JIDs de usuários para mencionar
     * @param quoted Se a mensagem deve ser enviada mencionando outra mensagem (true ou false)
     */
    sendGifFromURL(
      url: string,
      caption?: string,
      mentions?: string[],
      quoted?: boolean,
    ): Promise<proto.WebMessageInfo>;

    /**
     * Envia um gif a partir de um buffer.
     *
     * Exemplo:
     * ```javascript
     * import { ASSETS_DIR } from "../../config.js";
     * import { getBuffer } from "../../utils/index.js";
     * import path from "node:path";
     * import fs from "node:fs";
     *
     * const buffer = fs.readFileSync(path.join(ASSETS_DIR, "samples", "sample-video.mp4"));
     * // ou
     * const buffer = await getBuffer("https://exemplo.com/video.gif");
     * await sendGifFromBuffer(buffer, "Aqui está seu gif @5511920202020!", ["5511920202020@s.whatsapp.net"]);
     * ```
     * @param buffer Buffer do gif
     * @param caption Texto da mensagem (opcional)
     * @param mentions Array opcional de JIDs de usuários para mencionar
     * @param quoted Se a mensagem deve ser enviada mencionando outra mensagem (true ou false)
     */
    sendGifFromBuffer(
      buffer: Buffer,
      caption?: string,
      mentions?: string[],
      quoted?: boolean,
    ): Promise<proto.WebMessageInfo>;

    /**
     * Envia uma imagem a partir de um arquivo local.
     *
     * Exemplo:
     * ```javascript
     * await sendImageFromFile("./assets/image.png", "Aqui está sua imagem @5511920202020!", ["5511920202020@s.whatsapp.net"]);
     * ```
     * @param file Caminho do arquivo no servidor
     * @param caption Texto da mensagem (opcional)
     * @param mentions Array opcional de JIDs de usuários para mencionar
     * @param quoted Se a mensagem deve ser enviada mencionando outra mensagem (true ou false)
     */
    sendImageFromFile(
      file: string,
      caption?: string,
      mentions?: string[],
      quoted?: boolean,
    ): Promise<proto.WebMessageInfo>;

    /**
     * Envia uma imagem a partir de um buffer.
     *
     * Exemplo:
     * ```javascript
     * import fs from "node:fs";
     * import { getBuffer } from "../../utils/index.js";
     *
     * const buffer = fs.readFileSync("./assets/image.png");
     * // ou
     * const buffer = await getBuffer("https://exemplo.com/imagem.png");
     * await sendImageFromBuffer(buffer, "Aqui está sua imagem @5511920202020!", ["5511920202020@s.whatsapp.net"]);
     * ```
     * @param buffer Buffer da imagem
     * @param caption Texto da mensagem (opcional)
     * @param mentions Array opcional de JIDs de usuários para mencionar
     * @param quoted Se a mensagem deve ser enviada mencionando outra mensagem (true ou false)
     */
    sendImageFromBuffer(
      buffer: Buffer,
      caption?: string,
      mentions?: string[],
      quoted?: boolean,
    ): Promise<proto.WebMessageInfo>;

    /**
     * Envia uma imagem a partir de uma URL.
     *
     * Exemplo:
     * ```javascript
     * await sendImageFromURL("https://exemplo.com/imagem.png", "Aqui está sua imagem @5511920202020!", ["5511920202020@s.whatsapp.net"]);
     * ```
     * @param url URL da imagem a ser enviada
     * @param caption Texto da mensagem (opcional)
     * @param mentions Array opcional de JIDs de usuários para mencionar
     * @param quoted Se a mensagem deve ser enviada mencionando outra mensagem (true ou false)
     */
    sendImageFromURL(
      url: string,
      caption?: string,
      mentions?: string[],
      quoted?: boolean,
    ): Promise<proto.WebMessageInfo>;

    /**
     * Envia uma localização geográfica.
     *
     * Exemplo:
     * ```javascript
     * await sendLocation(-23.550520, -46.633308);
     * ```
     * @param latitude Latitude da localização
     * @param longitude Longitude da localização
     */
    sendLocation(latitude: number, longitude: number): Promise<void>;

    /**
     * Envia uma reação (emoji) na mensagem.
     *
     * Exemplo:
     * ```javascript
     * await sendReact("👍");
     * ```
     * @param emoji Emoji para reagir
     */
    sendReact(emoji: string): Promise<proto.WebMessageInfo>;

    /**
     * Simula uma ação de digitação, enviando uma mensagem de estado.
     *
     * @param anotherJid ID de outro grupo/usuário para enviar o estado (opcional)
     */
    sendTypingState(anotherJid?: string): Promise<void>;

    /**
     * Simula uma ação de gravação de áudio, enviando uma mensagem de estado.
     *
     * @param anotherJid ID de outro grupo/usuário para enviar o estado (opcional)
     */
    sendRecordState(anotherJid?: string): Promise<void>;

    /**
     * Envia uma reação de sucesso (emoji ✅) na mensagem
     */
    sendSuccessReact(): Promise<proto.WebMessageInfo>;

    /**
     * Envia uma reação de erro (emoji ⏳) na mensagem.
     */
    sendWaitReact(): Promise<proto.WebMessageInfo>;

    /**
     * Envia uma reação de erro (emoji ⚠️) na mensagem.
     */
    sendWarningReact(): Promise<proto.WebMessageInfo>;

    /**
     * Envia uma reação de erro (emoji ❌) na mensagem.
     */
    sendErrorReact(): Promise<proto.WebMessageInfo>;

    /**
     * Envia uma mensagem como resposta.
     *
     * Exemplo:
     * ```javascript
     * await sendReply("Aqui está sua resposta!", [mentions]);
     * ```
     * @param text Texto da mensagem
     * @param mentions Array opcional de IDs de usuários para mencionar
     */
    sendReply(text: string, mentions?: string[]): Promise<proto.WebMessageInfo>;

    /**
     * Envia uma mensagem de sucesso como resposta.
     *
     * Exemplo:
     * ```javascript
     * await sendSuccessReply("Operação concluída com sucesso!");
     * ```
     * @param text Texto da mensagem de sucesso
     * @param mentions Array opcional de IDs de usuários para mencionar
     */
    sendSuccessReply(
      text: string,
      mentions?: string[],
    ): Promise<proto.WebMessageInfo>;

    /**
     * Envia uma mensagem de atenção como resposta.
     *
     * Exemplo:
     * ```javascript
     * await sendWarningReply("Atenção! Algo não está certo.");
     * ```
     * @param text Texto da mensagem de erro
     * @param mentions Array opcional de IDs de usuários para mencionar
     */
    sendWarningReply(
      text: string,
      mentions?: string[],
    ): Promise<proto.WebMessageInfo>;

    /**
     * Envia uma mensagem de aguarde como resposta.
     *
     * Exemplo:
     * ```javascript
     * await sendWaitReply("Aguarde, estou processando sua solicitação...");
     * ```
     * @param text Texto da mensagem de erro
     * @param mentions Array opcional de IDs de usuários para mencionar
     */
    sendWaitReply(
      text: string,
      mentions?: string[],
    ): Promise<proto.WebMessageInfo>;

    /**
     * Envia uma mensagem de erro como resposta.
     *
     * Exemplo:
     * ```javascript
     * await sendErrorReply("Não foi possível encontrar resultados!");
     * ```
     * @param text Texto da mensagem de erro
     * @param mentions Array opcional de IDs de usuários para mencionar
     */
    sendErrorReply(
      text: string,
      mentions?: string[],
    ): Promise<proto.WebMessageInfo>;

    /**
     * Envia um sticker a partir de um arquivo local.
     *
     * Exemplo:
     * ```javascript
     * await sendStickerFromFile("./assets/sticker.webp");
     * ```
     * @param path Caminho do arquivo no servidor
     * @param quoted Se a mensagem deve ser enviada mencionando outra mensagem (true ou false)
     */
    sendStickerFromFile(
      path: string,
      quoted?: boolean,
    ): Promise<proto.WebMessageInfo>;

    /**
     * Envia um sticker a partir de uma URL.
     *
     * Exemplo:
     * ```javascript
     * await sendStickerFromURL("https://exemplo.com/sticker.webp");
     * ```
     * @param url URL do sticker a ser enviado
     * @param quoted Se a mensagem deve ser enviada mencionando outra mensagem (true ou false)
     */
    sendStickerFromURL(
      url: string,
      quoted?: boolean,
    ): Promise<proto.WebMessageInfo>;

    /**
     * Envia um sticker a partir de um buffer.
     *
     * Exemplo:
     * ```javascript
     * import { ASSETS_DIR } from "../../config.js";
     * import { getBuffer } from "../../utils/index.js";
     * import path from "node:path";
     * import fs from "node:fs";
     *
     * const buffer = fs.readFileSync(path.join(ASSETS_DIR, "samples", "sample-sticker.webp"));
     * // ou
     * const buffer = await getBuffer("https://exemplo.com/sticker.webp");
     * await sendStickerFromBuffer(buffer);
     * ```
     * @param buffer Buffer do sticker
     * @param quoted Se a mensagem deve ser enviada mencionando outra mensagem (true ou false)
     */
    sendStickerFromBuffer(
      buffer: Buffer,
      quoted?: boolean,
    ): Promise<proto.WebMessageInfo>;

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
    sendText(text: string, mentions?: string[]): Promise<proto.WebMessageInfo>;

    /**
     * Envia um vídeo a partir de um arquivo local.
     *
     * Exemplo:
     * ```javascript
     * await sendVideoFromFile("./assets/video.mp4", "Aqui está seu vídeo!", ["5511920202020@s.whatsapp.net"]);
     * ```
     * @param file Caminho do arquivo no servidor
     * @param caption Texto da mensagem (opcional)
     * @param mentions Array opcional de JIDs de usuários para mencionar
     * @param quoted Se a mensagem deve ser enviada mencionando outra mensagem (true ou false)
     */
    sendVideoFromFile(
      file: string,
      caption?: string,
      mentions?: string[],
      quoted?: boolean,
    ): Promise<proto.WebMessageInfo>;

    /**
     * Envia um vídeo a partir de uma URL.
     *
     * Exemplo:
     * ```javascript
     * await sendVideoFromURL("https://exemplo.com/video.mp4", "Aqui está seu vídeo @5511920202020!", ["5511920202020@s.whatsapp.net"]);
     * ```
     * @param url URL do vídeo a ser enviado
     * @param caption Texto da mensagem (opcional)
     * @param mentions Array opcional de JIDs de usuários para mencionar
     * @param quoted Se a mensagem deve ser enviada mencionando outra mensagem (true ou false)
     */
    sendVideoFromURL(
      url: string,
      caption?: string,
      mentions?: string[],
      quoted?: boolean,
    ): Promise<proto.WebMessageInfo>;

    /**
     * Envia um vídeo a partir de um buffer.
     *
     * Exemplo:
     * ```javascript
     * import { ASSETS_DIR } from "../../config.js";
     * import { getBuffer } from "../../utils/index.js";
     * import path from "node:path";
     * import fs from "node:fs";
     *
     * const buffer = fs.readFileSync(path.join(ASSETS_DIR, "samples", "sample-video.mp4"));
     * // ou
     * const buffer = await getBuffer("https://exemplo.com/video.mp4");
     * await sendVideoFromBuffer(buffer, "Aqui está o vídeo @5511920202020!", ["5511920202020@s.whatsapp.net"]);
     * ```
     * @param buffer Buffer do vídeo
     * @param caption Texto da mensagem (opcional)
     * @param mentions Array opcional de JIDs de usuários para mencionar
     * @param quoted Se a mensagem deve ser enviada mencionando outra mensagem (true ou false)
     */
    sendVideoFromBuffer(
      buffer: Buffer,
      caption?: string,
      mentions?: string[],
      quoted?: boolean,
    ): Promise<proto.WebMessageInfo>;

    /**
     * Envia um documento a partir de um arquivo local.
     *
     * Exemplo:
     * ```javascript
     * import { ASSETS_DIR } from "../../config.js";
     * import path from "node:path";
     *
     * const filePath = path.join(ASSETS_DIR, "samples", "sample-document.pdf");
     * await sendDocumentFromFile(filePath, "application/pdf", "documento.pdf");
     * ```
     * @param filePath Caminho do arquivo
     * @param mimetype Tipo MIME do documento (ex: "application/pdf", "text/plain")
     * @param fileName Nome do arquivo que será exibido no WhatsApp
     * @param quoted Se a mensagem deve ser enviada mencionando outra mensagem (true ou false)
     */
    sendDocumentFromFile(
      filePath: string,
      mimetype?: string,
      fileName?: string,
      quoted?: boolean,
    ): Promise<proto.WebMessageInfo>;

    /**
     * Envia um documento a partir de uma URL.
     *
     * Exemplo:
     * ```javascript
     * await sendDocumentFromURL("https://exemplo.com/documento.pdf", "application/pdf", "documento.pdf");
     * ```
     * @param url URL do documento a ser enviado
     * @param mimetype Tipo MIME do documento (ex: "application/pdf", "text/plain")
     * @param fileName Nome do arquivo que será exibido no WhatsApp
     * @param quoted Se a mensagem deve ser enviada mencionando outra mensagem (true ou false)
     */
    sendDocumentFromURL(
      url: string,
      mimetype?: string,
      fileName?: string,
      quoted?: boolean,
    ): Promise<proto.WebMessageInfo>;

    /**
     * Envia um documento a partir de um buffer.
     *
     * Exemplo:
     * ```javascript
     * import { ASSETS_DIR } from "../../config.js";
     * import { getBuffer } from "../../utils/index.js";
     * import path from "node:path";
     * import fs from "node:fs";
     *
     * const buffer = fs.readFileSync(path.join(ASSETS_DIR, "samples", "sample-document.pdf"));
     * // ou
     * const buffer = await getBuffer("https://exemplo.com/documento.pdf");
     * await sendDocumentFromBuffer(buffer, "application/pdf", "documento.pdf");
     * ```
     * @param buffer Buffer do documento
     * @param mimetype Tipo MIME do documento (ex: "application/pdf", "text/plain")
     * @param fileName Nome do arquivo que será exibido no WhatsApp
     * @param quoted Se a mensagem deve ser enviada mencionando outra mensagem (true ou false)
     */
    sendDocumentFromBuffer(
      buffer: Buffer,
      mimetype?: string,
      fileName?: string,
      quoted?: boolean,
    ): Promise<proto.WebMessageInfo>;

    /**
     * Obtém metadados completos do grupo.
     *
     * Exemplo:
     * ```javascript
     * const metadata = await getGroupMetadata();
     * console.log("Nome do grupo:", metadata.subject);
     * console.log("Participantes:", metadata.participants.length);
     * ```
     * @param jid ID do grupo (opcional, usa o grupo atual se não fornecido)
     * @returns Promise com metadados do grupo ou null se não for um grupo
     */
    getGroupMetadata(jid?: string): Promise<GroupMetadata | null>;

    /**
     * Obtém o nome do grupo.
     *
     * Exemplo:
     * ```javascript
     * const groupName = await getGroupName();
     * await sendReply(`Nome do grupo: ${groupName}`);
     * ```
     * @param groupJid ID do grupo (opcional, usa o grupo atual se não fornecido)
     * @returns Promise com o nome do grupo ou string vazia se não for um grupo
     */
    getGroupName(groupJid?: string): Promise<string>;

    /**
     * Obtém o ID do dono/criador do grupo.
     *
     * Exemplo:
     * ```javascript
     * const owner = await getGroupOwner();
     * await sendReply(`Dono do grupo: @${owner.split("@")[0]}`, [owner]);
     * ```
     * @param groupJid ID do grupo (opcional, usa o grupo atual se não fornecido)
     * @returns Promise com o ID do dono ou string vazia se não for um grupo
     */
    getGroupOwner(groupJid?: string): Promise<string>;

    /**
     * Obtém lista de participantes do grupo.
     *
     * Exemplo:
     * ```javascript
     * const participants = await getGroupParticipants();
     * await sendReply(`Total de participantes: ${participants.length}`);
     * ```
     * @param groupJid ID do grupo (opcional, usa o grupo atual se não fornecido)
     * @returns Promise com array de participantes ou array vazio se não for um grupo
     */
    getGroupParticipants(groupJid?: string): Promise<any[]>;

    /**
     * Obtém lista de administradores do grupo.
     *
     * Exemplo:
     * ```javascript
     * const admins = await getGroupAdmins();
     * const adminList = admins.map(admin => `@${admin.split("@")[0]}`).join(", ");
     * await sendReply(`Administradores: ${adminList}`, admins);
     * ```
     * @param groupJid ID do grupo (opcional, usa o grupo atual se não fornecido)
     * @returns Promise com array de IDs dos administradores ou array vazio se não for um grupo
     */
    getGroupAdmins(groupJid?: string): Promise<string[]>;

    /**
     * Envia uma enquete/votação no chat.
     *
     * Exemplo:
     * ```javascript
     * const options = [
     *   { optionName: "Opção 1" },
     *   { optionName: "Opção 2" },
     *   { optionName: "Opção 3" }
     * ];
     *
     * await sendPoll("Qual a sua opção favorita?", options, true);
     * ```
     *
     * @param title Título da enquete
     * @param options Array de objetos com a propriedade optionName que são as opções da enquete
     * @param singleChoice Se true, permite apenas uma escolha por usuário. Se false, permite múltiplas escolhas
     * @returns Promise com o resultado da operação
     */
    sendPoll(
      title: string,
      options: { optionName: string }[],
      singleChoice?: boolean,
    ): Promise<proto.WebMessageInfo>;
  }
}

export {};
