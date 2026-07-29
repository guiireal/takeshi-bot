import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MARKER = "// Alterado por: Dev Gui";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, "..");
const patchesDir = join(projectRoot, "patches", "baileys");
const baileysDir = join(projectRoot, "node_modules", "baileys");

const colors = {
  red: "\x1b[0;31m",
  green: "\x1b[0;32m",
  yellow: "\x1b[1;33m",
  cyan: "\x1b[0;36m",
  reset: "\x1b[0m",
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function requireUnique(contents, needle, label) {
  const occurrences = contents.split(needle).length - 1;

  if (occurrences === 0) {
    throw new Error(
      `${label} não encontrado: ${JSON.stringify(needle.slice(0, 70))}`,
    );
  }

  if (occurrences > 1) {
    throw new Error(
      `${label} ambíguo (${occurrences}x): ${JSON.stringify(needle.slice(0, 70))}`,
    );
  }
}

function applyOperation(contents, op) {
  if (op.sentinel && contents.includes(op.sentinel)) {
    return contents;
  }

  if (op.type === "insertAfter") {
    requireUnique(contents, op.anchor, "âncora");

    if (op.addition.includes(op.anchor)) {
      throw new Error("adição contém a própria âncora");
    }

    return contents.replace(op.anchor, `${op.anchor}\n${op.addition}`);
  }

  if (op.type === "prepend") {
    return `${op.addition}\n${contents}`;
  }

  if (op.type === "replace") {
    if (contents.includes(op.replacement)) {
      return contents;
    }
    requireUnique(contents, op.search, "trecho");
    return contents.replace(op.search, op.replacement);
  }

  if (op.type === "remove") {
    if (!contents.includes(op.search)) {
      return contents;
    }
    requireUnique(contents, op.search, "trecho");
    return contents.replace(`${op.search}\n`, "");
  }

  throw new Error(`tipo de operação desconhecido: ${op.type}`);
}

function main() {
  if (!existsSync(baileysDir)) {
    log("yellow", "⚠️  node_modules/baileys não encontrado. Nada a fazer.");
    return;
  }

  if (!existsSync(patchesDir)) {
    log("yellow", "⚠️  patches/baileys não encontrado. Nada a fazer.");
    return;
  }

  const baileysVersion = JSON.parse(
    readFileSync(join(baileysDir, "package.json"), "utf8"),
  ).version;

  const opsFiles = readdirSync(patchesDir)
    .filter((file) => file.endsWith(".ops.json"))
    .sort();

  if (!opsFiles.length) {
    log("yellow", "⚠️  Nenhum patch encontrado em patches/baileys.");
    return;
  }

  log(
    "cyan",
    `🩹 Aplicando patches do Dev Gui no baileys ${baileysVersion}...`,
  );

  let applied = 0;
  let skipped = 0;
  let failed = 0;

  for (const opsFile of opsFiles) {
    let target = opsFile;

    try {
      const spec = JSON.parse(readFileSync(join(patchesDir, opsFile), "utf8"));
      target = spec.target;

      const targetPath = join(baileysDir, target);

      if (!existsSync(targetPath)) {
        throw new Error("arquivo alvo não existe no baileys instalado");
      }

      const originalRaw = readFileSync(targetPath, "utf8");

      if (originalRaw.startsWith(MARKER)) {
        log("green", `  ✅ já aplicado: ${target}`);
        skipped++;
        continue;
      }

      let contents = originalRaw.replace(/\r\n/g, "\n");

      for (const op of spec.ops) {
        contents = applyOperation(contents, op);
      }

      if (!contents.startsWith(MARKER)) {
        contents = `${MARKER}\n${contents}`;
      }

      writeFileSync(
        targetPath,
        contents.endsWith("\n") ? contents : `${contents}\n`,
        "utf8",
      );

      log("green", `  ✅ aplicado: ${target}`);
      applied++;
    } catch (error) {
      log("red", `  ❌ falhou: ${target}`);
      log("yellow", `     ${error.message}`);
      failed++;
    }
  }

  console.log();

  if (failed) {
    log(
      "red",
      `❌ ${failed} patch(es) falharam — botões e listas podem quebrar.`,
    );
    log(
      "yellow",
      "💡 O baileys mudou os trechos ancorados. Ajuste os arquivos em",
    );
    log(
      "yellow",
      "   patches/baileys/*.ops.json (campos anchor/search) e rode:",
    );
    log("yellow", "   npm run patch:baileys");
    return;
  }

  log(
    "green",
    `✅ Patches OK (${applied} aplicado(s), ${skipped} já presente(s)).`,
  );
}

main();
