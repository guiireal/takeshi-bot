import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_SUPPORT_FILES,
  DEFAULT_SUPPORT_MAX_CHARS_PER_FILE,
  buildSupportFallbackPlan,
  extractMarkdownSections,
  parseSupportPlannerResponse,
  resolveSupportFiles,
} from "../utils/support-context.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");

describe("Support Context", () => {
  describe("DEFAULT_SUPPORT_FILES", () => {
    it("should always include README.md in the base support context", () => {
      assert.ok(DEFAULT_SUPPORT_FILES.includes("README.md"));
    });
  });

  describe("extractMarkdownSections", () => {
    it("should extract only the requested top-level sections", () => {
      const markdown = `# TAKESHI BOT

## PROJECT_OVERVIEW
Overview content

## ARCHITECTURE
Architecture content

## STACK
Stack content
`;

      const result = extractMarkdownSections(markdown, [
        "PROJECT_OVERVIEW",
        "STACK",
      ]);

      assert.match(result, /## PROJECT_OVERVIEW/);
      assert.match(result, /Overview content/);
      assert.match(result, /## STACK/);
      assert.match(result, /Stack content/);
      assert.doesNotMatch(result, /## ARCHITECTURE/);
    });
  });

  describe("parseSupportPlannerResponse", () => {
    it("should parse JSON wrapped in a fenced code block", () => {
      const response = `\`\`\`json
{
  "sections": ["PROJECT_OVERVIEW", "STACK"],
  "files": ["src/config.js", ".skills/pterodactyl-specialist/SKILL.md"]
}
\`\`\``;

      const plan = parseSupportPlannerResponse(response);

      assert.deepStrictEqual(plan.sections, ["PROJECT_OVERVIEW", "STACK"]);
      assert.deepStrictEqual(plan.files, [
        "src/config.js",
        ".skills/pterodactyl-specialist/SKILL.md",
      ]);
    });
  });

  describe("resolveSupportFiles", () => {
    it("should load only existing files within the repository root", () => {
      const files = resolveSupportFiles({
        projectRoot,
        requestedFiles: [
          "src/config.js",
          ".skills/pterodactyl-specialist/SKILL.md",
        ],
      });

      assert.strictEqual(files.length, 2);
      assert.strictEqual(files[0].path, "src/config.js");
      assert.match(files[0].content, /export const PREFIX/);
      assert.doesNotMatch(files[0].content, /sk-proj-/);
      assert.doesNotMatch(files[0].content, /asOjDIpVROlnghw4jKDt/);
      assert.strictEqual(
        files[1].path,
        ".skills/pterodactyl-specialist/SKILL.md",
      );
    });

    it("should ignore path traversal and missing files", () => {
      const files = resolveSupportFiles({
        projectRoot,
        requestedFiles: [
          "../outside.txt",
          "src/config.js",
          "arquivo-que-nao-existe.js",
        ],
      });

      assert.strictEqual(files.length, 1);
      assert.strictEqual(files[0].path, "src/config.js");
    });

    it("should include the supported hosts section from README in the default support file window", () => {
      const files = resolveSupportFiles({
        projectRoot,
        requestedFiles: ["README.md"],
        maxCharsPerFile: DEFAULT_SUPPORT_MAX_CHARS_PER_FILE,
      });

      assert.strictEqual(files.length, 1);
      assert.strictEqual(files[0].path, "README.md");
      assert.match(files[0].content, /\*\*Hosts suportadas\*\*/);
      assert.match(files[0].content, /Bronxys/);
      assert.match(files[0].content, /NexFuture/);
      assert.match(files[0].content, /Speed Cloud/);
      assert.match(files[0].content, /https:\/\/bronxyshost\.com\//);
      assert.match(files[0].content, /https:\/\/nexfuture\.com\.br\//);
      assert.match(files[0].content, /https:\/\/speedhosting\.cloud\//);
    });
  });

  describe("buildSupportFallbackPlan", () => {
    it("should include README and Pterodactyl skill for hosting questions", () => {
      const plan = buildSupportFallbackPlan({
        projectRoot,
        text: "onde hospedar o takeshi em pterodactyl?",
      });

      assert.ok(plan.sections.includes("HOSTING_AND_PTERODACTYL"));
      assert.ok(plan.files.includes("README.md"));
      assert.ok(plan.files.includes(".skills/pterodactyl-specialist/SKILL.md"));
    });

    it("should include README for installation questions", () => {
      const plan = buildSupportFallbackPlan({
        projectRoot,
        text: "como instalar no termux?",
      });

      assert.ok(plan.files.includes("README.md"));
    });

    it("should include README when a supported host name is mentioned directly", () => {
      const plan = buildSupportFallbackPlan({
        projectRoot,
        text: "manda o link do grupo da bronxys",
      });

      assert.ok(plan.files.includes("README.md"));
    });

    it("should detect supported hosts dynamically from README", () => {
      const tempRoot = fs.mkdtempSync(
        path.join(os.tmpdir(), "takeshi-support-context-"),
      );

      fs.mkdirSync(path.join(tempRoot, "src", "commands"), {
        recursive: true,
      });
      fs.writeFileSync(
        path.join(tempRoot, "README.md"),
        `# README

## Instalação nas principais hosts do Brasil

**Hosts suportadas**:

        | Aurora Cloud | Outra Plataforma |
        |---------------|------------------|
        | [Painel](https://aurora.example.com) | [Painel](https://outra.example.com) |
`,
      );

      const plan = buildSupportFallbackPlan({
        projectRoot: tempRoot,
        text: "traga o link da Aurora Cloud",
      });

      assert.ok(plan.sections.includes("HOSTING_AND_PTERODACTYL"));
      assert.ok(plan.files.includes("README.md"));
    });

    it("should include update.sh for bot update questions", () => {
      const plan = buildSupportFallbackPlan({
        projectRoot,
        text: "como atualizar o bot?",
      });

      assert.ok(plan.files.includes("update.sh"));
    });
  });
});
