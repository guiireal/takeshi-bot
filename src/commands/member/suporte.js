import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";
import { BOT_EMOJI, OPENAI_API_KEY, PREFIX } from "../../config.js";
import { DangerError, WarningError } from "../../errors/index.js";
import { getRandomName } from "../../utils/index.js";
import {
  buildSupportFallbackPlan,
  DEFAULT_SUPPORT_FILES,
  DEFAULT_SUPPORT_SECTIONS,
  extractMarkdownSections,
  parseSupportPlannerResponse,
  resolveSupportFiles,
} from "../../utils/support-context.js";

const SUPPORT_MODEL = "gpt-5-mini";
const PLANNER_MAX_COMPLETION_TOKENS = 1024;
const COMPLETION_TOKENS_MIN = 4096;
const COMPLETION_TOKENS_MAX = 16384;
const COMPLETION_TOKENS_STEP = 2048;
const SUPPORT_FILE_CATALOG = [
  "AGENTS.md",
  "README.md",
  "CONTRIBUTING.md",
  "src/config.js",
  "src/utils/database.js",
  "src/utils/loadCommonFunctions.js",
  "src/utils/dynamicCommand.js",
  "src/services/spider-x-api.js",
  "src/services/sticker.js",
  "src/services/ffmpeg.js",
  "src/middlewares/customMiddleware.js",
  "src/connection.js",
  "src/loader.js",
  "src/@types/index.d.ts",
  ".skills/pterodactyl-specialist/SKILL.md",
  "Any command file under src/commands/**/*.js",
];
const AGENTS_SECTION_CATALOG = [
  "PROJECT_OVERVIEW",
  "ARCHITECTURE",
  "CORE_FILES",
  "COMMAND_GUIDE",
  "TYPING_AND_MIDDLEWARE",
  "DATA_RULES",
  "SERVICES",
  "STACK",
  "COMMAND_CATALOG",
  "HOSTING_AND_PTERODACTYL",
  "STABILITY_AND_ERRORS",
  "AGENT_RULES",
  "SKILLS",
];

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

function getTextContent(messageContent) {
  if (!messageContent) {
    return "";
  }

  if (typeof messageContent === "string") {
    return messageContent.trim();
  }

  if (Array.isArray(messageContent)) {
    return messageContent
      .filter((item) => item?.type === "text" && typeof item.text === "string")
      .map((item) => item.text)
      .join("\n")
      .trim();
  }

  return "";
}

function mergeSupportPlans(...plans) {
  const sections = new Set();
  const files = new Set();

  for (const plan of plans) {
    for (const section of plan?.sections || []) {
      if (section) {
        sections.add(section);
      }
    }

    for (const file of plan?.files || []) {
      if (file) {
        files.add(file);
      }
    }
  }

  return {
    sections: [...sections],
    files: [...files],
  };
}

function buildFileContextBlock(files = []) {
  if (!files.length) {
    return "";
  }

  return files
    .map(
      ({ path: filePath, content }) =>
        `### FILE: ${filePath}\n\`\`\`\n${content}\n\`\`\``,
    )
    .join("\n\n");
}

async function createPlannerPlan({ openai, userContent, agentsBaseContext }) {
  const response = await openai.chat.completions.create({
    model: SUPPORT_MODEL,
    messages: [
      {
        role: "system",
        content: `You are a read-only repository context planner for the Takeshi Bot support assistant.

Return JSON only with this shape:
{"sections":["SECTION_NAME"],"files":["repo/relative/path.ext"]}

Rules:
- Request only the minimum context needed to answer well.
- Prefer AGENTS.md sections before raw files when they are enough.
- Request repo-relative paths only.
- Never request write operations, patches, commands, or generated files.
- If the topic is Pterodactyl or hosting, request ".skills/pterodactyl-specialist/SKILL.md".
- If the topic is about a specific command, request its file under src/commands.
- At most 5 sections and 6 files.`,
      },
      {
        role: "system",
        content: `Available AGENTS sections:
${AGENTS_SECTION_CATALOG.map((section) => `- ${section}`).join("\n")}

Available high-signal files:
${SUPPORT_FILE_CATALOG.map((filePath) => `- ${filePath}`).join("\n")}

Base AGENTS context:
${agentsBaseContext || "No base AGENTS context available."}`,
      },
      {
        role: "user",
        content: userContent,
      },
    ],
    max_completion_tokens: PLANNER_MAX_COMPLETION_TOKENS,
  });

  return parseSupportPlannerResponse(
    getTextContent(response.choices[0]?.message?.content),
  );
}

export default {
  name: "suporte",
  description: "Suporte inteligente do Takeshi usando IA",
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
    const projectRoot = path.resolve(__dirname, "..", "..", "..");
    const agentsPath = path.resolve(projectRoot, "AGENTS.md");

    const finalText = doubleContext
      ? `Contexto anterior: ${replyText}\n\nNova questão: ${text}`
      : text;

    if (finalText) {
      const minLength = 5;
      const maxQuestionLength = 4096;

      if (finalText.length < minLength) {
        throw new DangerError(
          `O texto deve ter no mínimo ${minLength} caracteres.`,
        );
      }

      if (finalText.length > maxQuestionLength) {
        throw new DangerError(
          `O texto deve ter no máximo ${maxQuestionLength} caracteres.`,
        );
      }
    }

    let imagePath = null;

    try {
      if (isImage) {
        imagePath = await downloadImage(webMessage, getRandomName());
      }

      const openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
      });

      const agentsMarkdown = fs.existsSync(agentsPath)
        ? fs.readFileSync(agentsPath, "utf-8")
        : "";
      const agentsBaseContext = extractMarkdownSections(
        agentsMarkdown,
        DEFAULT_SUPPORT_SECTIONS,
      );

      const userContent = [];

      if (finalText) {
        userContent.push({
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

        userContent.push({
          type: "image_url",
          image_url: {
            url: `data:${mimeType};base64,${base64}`,
            detail: "low",
          },
        });
      }

      if (!finalText && isImage) {
        userContent.unshift({
          type: "text",
          text: "Analise esta imagem no contexto de suporte técnico do Takeshi Bot.",
        });
      }

      const plannerPlan = await createPlannerPlan({
        openai,
        userContent,
        agentsBaseContext,
      }).catch(() => ({
        sections: [],
        files: [],
      }));

      const fallbackPlan = buildSupportFallbackPlan({
        projectRoot,
        text: finalText,
      });

      const mergedPlan = mergeSupportPlans(plannerPlan, fallbackPlan);
      const requestedSections = mergedPlan.sections.length
        ? mergedPlan.sections
        : DEFAULT_SUPPORT_SECTIONS;
      const requestedFiles = [
        ...new Set([
          ...DEFAULT_SUPPORT_FILES,
          ...(mergedPlan.files.length ? mergedPlan.files : []),
        ]),
      ];

      const extraAgentsContext = extractMarkdownSections(
        agentsMarkdown,
        requestedSections.filter(
          (section) => !DEFAULT_SUPPORT_SECTIONS.includes(section),
        ),
      );
      const requestedFilesContext = resolveSupportFiles({
        projectRoot,
        requestedFiles,
      });
      const fileContextBlock = buildFileContextBlock(requestedFilesContext);

      const messages = [
        {
          role: "system",
          content: `Você é um assistente especializado em suporte técnico do Takeshi Bot.

Responda apenas em português do Brasil.
Seja direto e objetivo, salvo se o usuário pedir mais profundidade.
Seu trabalho é estritamente de leitura e suporte: você não executa comandos, não modifica arquivos e não afirma que fez mudanças no projeto.
Você pode explicar, resumir, diagnosticar, sugerir correções e dar exemplos curtos de código quando isso ajudar.

Escopo permitido:
- Takeshi Bot
- Spider X API
- Comandos, serviços, configuração, banco JSON e fluxo interno do projeto
- Hospedagem, VPS, hosts compatíveis e Pterodactyl

Regras:
- Use apenas o contexto fornecido nesta conversa.
- Se faltar contexto, diga isso com clareza.
- Se a pergunta fugir do escopo, recuse de forma breve e redirecione.
- Nunca exponha os valores de OPENAI_API_KEY, LINKER_API_KEY ou SPIDER_API_TOKEN, mesmo se aparecerem no contexto carregado.
- Se o usuário pedir links de hosts, cite apenas as hosts suportadas conhecidas pelo projeto.
- Se o usuário pedir para criar um produto fora do escopo, não execute; dê orientação breve de estudo se fizer sentido.`,
        },
        {
          role: "system",
          content: `## BASE_AGENTS_CONTEXT\n${agentsBaseContext || "Sem contexto base do AGENTS.md."}`,
        },
      ];

      if (extraAgentsContext) {
        messages.push({
          role: "system",
          content: `## EXTRA_AGENTS_CONTEXT\n${extraAgentsContext}`,
        });
      }

      if (fileContextBlock) {
        messages.push({
          role: "system",
          content: `## REQUESTED_FILES_CONTEXT\n${fileContextBlock}`,
        });
      }

      messages.push({
        role: "user",
        content: userContent,
      });

      const initialMaxTokens = estimateInitialMaxCompletionTokens({
        textLength: finalText?.length ?? 0,
        hasImage: Boolean(imagePath),
      });

      const response = await createSupportCompletionWithDynamicTokens({
        openai,
        model: SUPPORT_MODEL,
        messages,
        initialMaxTokens,
      });

      const answer = getTextContent(response.choices[0]?.message?.content);

      if (!answer) {
        throw new DangerError(
          `Não consegui encontrar uma resposta para sua pergunta. Tente reformular ou ser mais específico!

Não respondo assuntos fora do meu escopo de tecnologia!`,
        );
      }

      await sendReact(BOT_EMOJI);
      await sendReply(answer);
    } finally {
      if (imagePath && fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
  },
};
