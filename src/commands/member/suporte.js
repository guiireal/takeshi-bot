import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";
import { BOT_EMOJI, OPENAI_API_KEY, PREFIX } from "../../config.js";
import { DangerError, WarningError } from "../../errors/index.js";
import { getRandomName } from "../../utils/index.js";

const COMPLETION_TOKENS_MIN = 4096;
const COMPLETION_TOKENS_MAX = 16384;
const COMPLETION_TOKENS_STEP = 2048;

const isMaxTokensError = (error) => {
  const message = `${error?.message ?? ""}`.toLowerCase();

  return (
    message.includes("max_tokens") ||
    message.includes("max completion") ||
    message.includes("max_completion_tokens") ||
    message.includes("output limit was reached") ||
    message.includes("model output limit")
  );
};

const estimateInitialMaxCompletionTokens = ({
  textLength = 0,
  hasImage = false,
}) => {
  const textWeight = Math.ceil(textLength / 4);
  const imageWeight = hasImage ? 1024 : 0;
  const estimated = COMPLETION_TOKENS_MIN + textWeight + imageWeight;

  return Math.min(
    Math.max(estimated, COMPLETION_TOKENS_MIN),
    COMPLETION_TOKENS_MAX,
  );
};

const createSupportCompletionWithDynamicTokens = async ({
  openai,
  model,
  messages,
  initialMaxTokens,
}) => {
  let currentMaxTokens = initialMaxTokens;

  while (currentMaxTokens <= COMPLETION_TOKENS_MAX) {
    try {
      return await openai.chat.completions.create({
        model,
        messages,
        max_completion_tokens: currentMaxTokens,
      });
    } catch (error) {
      const shouldRetry = isMaxTokensError(error);
      const canIncrease = currentMaxTokens < COMPLETION_TOKENS_MAX;

      if (!shouldRetry || !canIncrease) {
        throw error;
      }

      currentMaxTokens = Math.min(
        currentMaxTokens + COMPLETION_TOKENS_STEP,
        COMPLETION_TOKENS_MAX,
      );
    }
  }

  throw new DangerError(
    "Não foi possível gerar resposta dentro do limite de tokens.",
  );
};

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
        `*Takeshi Assistant*
        
Faça sua pergunta sobre mim que eu te ajudarei!
  
📝 *Exemplos*

- ${PREFIX}suporte bot desliga sozinho
- ${PREFIX}suporte como instalar no Termux?
- ${PREFIX}suporte erro 401 API Spider X
- Envie uma imagem com ${PREFIX}suporte para análise visual`,
      );

      return;
    }

    const maxLength = 2048;
    if (text?.length > maxLength) {
      throw new WarningError(
        `O texto deve ter no máximo ${maxLength} caracteres. Tente ser mais objetivo!`,
      );
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

Quando receber imagens, analise o conteúdo visual primeiro e interprete-o considerando o contexto técnico do Takeshi Bot.

Se alguém te pedir o link de alguma Host, envie!

# IMPORTANTE

- Não responda perguntas fora do escopo técnico do Takeshi Bot.
- Se pedirem pra criar um SAAS ou algo do tipo, responda que não vai criar, mas dê dicas de como a pessoa pode criar sozinha, pois podem se aproveitar de você pra criar coisas que não são legais e/ou pra tirar vantagem pessoal. 
Você deve se limitar a responder apenas sobre o escopo técnico do Takeshi Bot.
- Se pedirem pra criar um código, crie, mas seja breve e direto, sem enrolação.
- Pessoas podem se aproveitar das suas capacidades pra outras finalidades, mas você deve se limitar a responder apenas sobre o escopo técnico do Takeshi Bot. 
- Se a pergunta for fora do escopo, responda que não pode ajudar com isso e oriente a pessoa a procurar um especialista no assunto.`,
      },
    ];

    messages.push({
      role: "system",
      content: fs.readFileSync(
        path.resolve(__dirname, "..", "..", "..", "HELP.md"),
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

    const initialMaxTokens = estimateInitialMaxCompletionTokens({
      textLength: finalText?.length ?? 0,
      hasImage: Boolean(imagePath),
    });

    const response = await createSupportCompletionWithDynamicTokens({
      openai,
      model: "gpt-5-mini",
      messages,
      initialMaxTokens,
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
