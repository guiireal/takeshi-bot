import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";
import { BOT_EMOJI, OPENAI_API_KEY, PREFIX } from "../../config.js";
import { DangerError, WarningError } from "../../errors/index.js";
import { getRandomName } from "../../utils/index.js";

export default {
  name: "suporte",
  description: "Suporte inteligente do Takeshi usando IA treinada",
  commands: ["suporte", "help", "ajuda"],
  usage: `${PREFIX}suporte como instalar o Takeshi no Termux?

Você também pode enviar uma imagem com o comando ${PREFIX}suporte

Você também pode escrever o texto e responder a mensagem com o comando ${PREFIX}suporte`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    fullArgs,
    args,
    sendReply,
    sendWaitReply,
    sendReact,
    replyText,
    isImage,
    isVideo,
    isAudio,
    downloadImage,
    webMessage,
  }) => {
    if (!OPENAI_API_KEY) {
      throw new WarningError(
        "O suporte inteligente não está disponível no momento. Entre em contato com o administrador do bot!",
      );
    }

    if (isVideo) {
      throw new WarningError(
        "Não consigo interpretar vídeos ainda! Envie uma imagem ou texto!",
      );
    }

    if (isAudio) {
      throw new WarningError(
        "Não consigo interpretar áudios ainda! Envie uma imagem ou texto!",
      );
    }

    const doubleContext = args.length && replyText;
    const text = args.length ? fullArgs : replyText;

    if (!text && !isImage) {
      await sendReact(BOT_EMOJI);

      await sendReply(
        `*Takeshi Suporte*
        
Faça sua pergunta sobre mim que eu te ajudarei!
  
📝 *Exemplos*

- ${PREFIX}suporte bot desliga sozinho
- ${PREFIX}suporte como instalar no Termux?
- ${PREFIX}suporte erro 401 API Spider X
- Envie uma imagem com ${PREFIX}suporte para análise visual`,
      );

      return;
    }

    await sendWaitReply("Analisando sua pergunta...");

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const finalText = doubleContext
      ? `Contexto anterior: ${replyText}\n\nNova questão: ${text}`
      : text;

    if (finalText) {
      const minLength = 5;
      const maxLength = 4096;

      if (finalText.length < minLength) {
        throw new DangerError(
          `O texto deve ter no mínimo ${minLength} caracteres.`,
        );
      }

      if (finalText.length > maxLength) {
        throw new DangerError(
          `O texto deve ter no máximo ${maxLength} caracteres.`,
        );
      }
    }

    let imagePath = null;

    if (isImage) {
      imagePath = await downloadImage(webMessage, getRandomName());
    }

    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    const messages = [
      {
        role: "system",
        content: `Você é um assistente especializado em suporte técnico do Takeshi Bot.

Responda apenas assuntos relacionados a: tecnologia, programação, desenvolvimento de bots, inteligência artificial, 
machine learning, ou assuntos relacionados ao Takeshi Bot.

Responda apenas em português do Brasil.
Seja direto e objetivo nas respostas, salvo se o usuário solicitar explicações mais aprofundadas.

Escreva como alguém que realmente sabe do que está falando e vai direto ao ponto. 
Sem frases de abertura do tipo "Claro!", "Ótima pergunta!", "Com certeza!" ou similares. 
Sem encerramento do tipo "Espero ter ajudado!" ou "Qualquer dúvida é só perguntar!". 
Sem travessão (—) para estruturar listas ou ideias. Sem bullet points a menos que seja absolutamente necessário para clareza. 
Evite palavras de enchimento: "importante", "crucial", "fundamental", "robusto", "abrangente". 
Nunca responda de forma genérica quando uma resposta específica é possível. Se a pergunta for vaga, interprete da forma mais útil e responda com substância, não peça esclarecimentos desnecessários. 
Use exemplos concretos quando ajudar a explicar algo. Se tiver uma opinião sobre o assunto, diga, não fique em cima do muro.

Quando receber imagens, analise o conteúdo visual primeiro e interprete-o considerando o contexto técnico do Takeshi Bot.

Se alguém te pedir o link de alguma Host, envie as que você já conhece, 
sem mencionar Pterodactyl, pois os iniciantes não sabem o que é (exceto se perguntarem sobre)!`,
      },
    ];

    messages.push({
      role: "system",
      content: fs.readFileSync(
        path.resolve(__dirname, "..", "..", "..", "AGENTS.md"),
        "utf-8",
      ),
    });

    messages.push({
      role: "system",
      content: fs.readFileSync(
        path.resolve(__dirname, "..", "..", "..", "README.md"),
        "utf-8",
      ),
    });

    messages.push({
      role: "system",
      content: fs.readFileSync(
        path.resolve(__dirname, "..", "..", "..", "package.json"),
        "utf-8",
      ),
    });

    messages.push({
      role: "system",
      content: fs.readFileSync(
        path.resolve(__dirname, "..", "..", "menu.js"),
        "utf-8",
      ),
    });

    const userMessage = {
      role: "user",
      content: [],
    };

    if (finalText) {
      userMessage.content.push({
        type: "text",
        text: finalText,
      });
    }

    if (imagePath && fs.existsSync(imagePath)) {
      const buffer = fs.readFileSync(imagePath);
      const base64 = buffer.toString("base64");
      const ext = path.extname(imagePath).toLowerCase();

      let mimeType = "image/jpeg";
      switch (ext) {
        case ".png":
          mimeType = "image/png";
          break;
        case ".jpg":
        case ".jpeg":
          mimeType = "image/jpeg";
          break;
        case ".webp":
          mimeType = "image/webp";
          break;
        case ".gif":
          mimeType = "image/gif";
          break;
      }

      userMessage.content.push({
        type: "image_url",
        image_url: {
          url: `data:${mimeType};base64,${base64}`,
          detail: "low",
        },
      });
    }

    if (!finalText && isImage) {
      userMessage.content.unshift({
        type: "text",
        text: "O que você vê nesta imagem?",
      });
    }

    messages.push(userMessage);

    const response = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: messages,
      max_completion_tokens: 4096,
    });

    const answer = response.choices[0].message.content.trim();

    if (!answer) {
      throw new DangerError(
        `Não consegui encontrar uma resposta para sua pergunta. Tente reformular ou ser mais específico!

Não respondo assuntos fora do meu escopo de tecnologia!`,
      );
    }

    await sendReact(BOT_EMOJI);
    await sendReply(answer);

    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  },
};
