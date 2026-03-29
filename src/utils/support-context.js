import fs from "node:fs";
import path from "node:path";

export const DEFAULT_SUPPORT_SECTIONS = [
  "PROJECT_OVERVIEW",
  "ARCHITECTURE",
  "STACK",
  "AGENT_RULES",
  "SKILLS",
];
export const DEFAULT_SUPPORT_FILES = ["README.md"];
const SUPPORTED_HOST_KEYWORDS = [
  "bronxys",
  "nexfuture",
  "speed cloud",
  "speedhosting",
  "ted host",
  "tedhost",
  "nodz host",
  "nodzhostinger",
  "cebolinha host",
  "raikken",
  "imperio cloud",
  "imperiocloud",
];

function redactSensitiveContent(content) {
  return `${content}`
    .replace(
      /((?:export\s+const|const|let|var)\s+(?:OPENAI_API_KEY|LINKER_API_KEY|SPIDER_API_TOKEN)\s*=\s*)(["'`])[\s\S]*?\2/g,
      '$1"$REDACTED"',
    )
    .replace(
      /((?:OPENAI_API_KEY|LINKER_API_KEY|SPIDER_API_TOKEN)\s*:\s*)(["'`])[\s\S]*?\2/g,
      '$1"$REDACTED"',
    );
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join("/");
}

function normalizeSectionNames(sectionNames = []) {
  return [
    ...new Set(sectionNames.map((name) => `${name}`.trim()).filter(Boolean)),
  ];
}

function extractExplicitFilePaths(text = "") {
  const matches = new Set();
  const normalizedText = `${text}`;
  const pathPattern = /(?:\.?[\w-]+\/)+[\w.-]+\.(?:md|js|json|ts|d\.ts|sh)/gi;

  for (const match of normalizedText.matchAll(pathPattern)) {
    matches.add(match[0]);
  }

  for (const fileName of ["AGENTS.md", "README.md", "CONTRIBUTING.md"]) {
    if (normalizedText.includes(fileName)) {
      matches.add(fileName);
    }
  }

  return [...matches];
}

function normalizeForMatching(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function findMatchingCommandFiles(projectRoot, text = "", maxFiles = 3) {
  const normalizedText = normalizeForMatching(text);
  if (!normalizedText.trim()) {
    return [];
  }

  const commandsDir = path.resolve(projectRoot, "src", "commands");
  const stack = [commandsDir];
  const matches = [];

  while (stack.length) {
    const currentDir = stack.pop();
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.resolve(currentDir, entry.name);

      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }

      if (!entry.isFile() || path.extname(entry.name) !== ".js") {
        continue;
      }

      const baseName = path.basename(entry.name, ".js");
      const regex = new RegExp(
        `(^|[^a-z0-9])${baseName.replace(/-/g, "[-\\s_]?")}([^a-z0-9]|$)`,
        "i",
      );

      if (regex.test(normalizedText)) {
        matches.push(
          path.relative(projectRoot, fullPath).split(path.sep).join("/"),
        );
      }

      if (matches.length >= maxFiles) {
        return [...new Set(matches)];
      }
    }
  }

  return [...new Set(matches)];
}

export function buildSupportFallbackPlan({ projectRoot, text = "" }) {
  const normalizedText = normalizeForMatching(text);
  const sections = new Set(DEFAULT_SUPPORT_SECTIONS);
  const files = new Set(extractExplicitFilePaths(text));
  const mentionsSupportedHost = SUPPORTED_HOST_KEYWORDS.some((keyword) =>
    normalizedText.includes(keyword),
  );

  for (const commandPath of findMatchingCommandFiles(projectRoot, text)) {
    files.add(commandPath);
  }

  if (
    mentionsSupportedHost ||
    /(pterodactyl|hosting|host|startup|sftp|panel|schedule|vps|hospedar|hospedagem)/i.test(
      normalizedText,
    )
  ) {
    sections.add("HOSTING_AND_PTERODACTYL");
    files.add(".skills/pterodactyl-specialist/SKILL.md");
  }

  if (
    /(config|prefix|token|api key|openai|spider|database|configurar|prefixo)/i.test(
      normalizedText,
    )
  ) {
    sections.add("DATA_RULES");
    files.add("src/config.js");
    files.add("src/utils/database.js");
  }

  if (
    /(middleware|hook|commonfunctions|loadcommonfunctions|intercept)/i.test(
      normalizedText,
    )
  ) {
    sections.add("TYPING_AND_MIDDLEWARE");
    files.add("src/middlewares/customMiddleware.js");
    files.add("src/utils/loadCommonFunctions.js");
  }

  if (
    /(sticker|figurinha|webp|gif|audio|video|ffmpeg|to-mp3|to-gif|to-image)/i.test(
      normalizedText,
    )
  ) {
    sections.add("SERVICES");
    files.add("src/services/sticker.js");
    files.add("src/services/ffmpeg.js");
  }

  if (
    mentionsSupportedHost ||
    /(install|instalar|termux|readme|host|hospedar|hospedagem)/i.test(
      normalizedText,
    )
  ) {
    files.add("README.md");
  }

  return {
    sections: [...sections],
    files: [...files],
  };
}

export function extractMarkdownSections(markdown, sectionNames = []) {
  if (!markdown || !sectionNames.length) {
    return "";
  }

  const lines = markdown.split(/\r?\n/);
  const sections = new Map();
  let currentSection = null;
  let buffer = [];

  const flushCurrentSection = () => {
    if (currentSection && buffer.length) {
      sections.set(currentSection, buffer.join("\n").trim());
    }
  };

  for (const line of lines) {
    const match = line.match(/^##\s+([A-Z0-9_]+)\s*$/);

    if (match) {
      flushCurrentSection();
      currentSection = match[1];
      buffer = [line];
      continue;
    }

    if (currentSection) {
      buffer.push(line);
    }
  }

  flushCurrentSection();

  return normalizeSectionNames(sectionNames)
    .map((name) => sections.get(name))
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function extractJsonCandidate(content) {
  const trimmed = `${content ?? ""}`.trim();

  if (!trimmed) {
    return "{}";
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const objectMatch = trimmed.match(/\{[\s\S]*\}/);
  if (objectMatch?.[0]) {
    return objectMatch[0];
  }

  return trimmed;
}

export function parseSupportPlannerResponse(content) {
  try {
    const parsed = JSON.parse(extractJsonCandidate(content));

    return {
      sections: normalizeSectionNames(parsed.sections),
      files: [
        ...new Set(
          (parsed.files || []).map((file) => `${file}`.trim()).filter(Boolean),
        ),
      ],
    };
  } catch {
    return {
      sections: [],
      files: [],
    };
  }
}

function isSafeResolvedFile(projectRoot, resolvedPath) {
  const normalizedRoot = path.resolve(projectRoot);
  const normalizedPath = path.resolve(resolvedPath);

  return (
    normalizedPath === normalizedRoot ||
    normalizedPath.startsWith(`${normalizedRoot}${path.sep}`)
  );
}

export function resolveSupportFiles({
  projectRoot,
  requestedFiles = [],
  maxFiles = 6,
  maxCharsPerFile = 12000,
}) {
  const normalizedRoot = path.resolve(projectRoot);
  const files = [];
  const seen = new Set();

  for (const requestedFile of requestedFiles) {
    if (files.length >= maxFiles) {
      break;
    }

    const cleanedFile = `${requestedFile}`.trim();
    if (!cleanedFile) {
      continue;
    }

    const resolvedPath = path.resolve(normalizedRoot, cleanedFile);
    if (!isSafeResolvedFile(normalizedRoot, resolvedPath)) {
      continue;
    }

    if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isFile()) {
      continue;
    }

    const relativePath = toPosixPath(
      path.relative(normalizedRoot, resolvedPath),
    );
    if (seen.has(relativePath)) {
      continue;
    }

    const rawContent = fs.readFileSync(resolvedPath, "utf-8");
    const sanitizedContent = redactSensitiveContent(rawContent);
    const content =
      sanitizedContent.length > maxCharsPerFile
        ? `${sanitizedContent.slice(0, maxCharsPerFile)}\n\n...[truncated]`
        : sanitizedContent;

    seen.add(relativePath);
    files.push({
      path: relativePath,
      content,
    });
  }

  return files;
}
