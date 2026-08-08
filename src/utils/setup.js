/**
 * @author Dev Gui
 */
import boxen from "boxen";
import chalk from "chalk";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { COMMANDS_DIR } from "../config.js";
import {
  isSetupCompleted,
  markSetupCompleted,
  setLinkerApiKey,
  setSpiderApiToken,
} from "./database.js";
import { question } from "./index.js";
import {
  errorLog,
  getTerminalWidth,
  infoLog,
  successLog,
  warningLog,
} from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUTH_SQLITE_PATH = path.resolve(
  __dirname,
  "..",
  "..",
  "assets",
  "auth",
  "zapo",
  "state.sqlite",
);

function setupBoxWidth() {
  return Math.max(32, Math.min(getTerminalWidth() - 4, 72));
}

function printStepBox(title, body, borderColor = "cyan") {
  console.log(
    boxen(body, {
      padding: 1,
      margin: { top: 1, bottom: 0 },
      borderStyle: "round",
      borderColor,
      title,
      titleAlignment: "center",
      width: setupBoxWidth(),
    }),
  );
}

async function askChoice(prompt, validOptions) {
  while (true) {
    const answer = (await question(prompt)).trim();

    if (validOptions.includes(answer)) {
      return answer;
    }

    warningLog(`Opção inválida. Digite ${validOptions.join(" ou ")}.`);
  }
}

async function askToken(prompt) {
  while (true) {
    const token = (await question(prompt)).trim();

    if (token.length >= 4) {
      return token;
    }

    warningLog("Valor muito curto. Cole o token/chave completo.");
  }
}

function hasExistingAuthSession() {
  try {
    if (!fs.existsSync(AUTH_SQLITE_PATH)) {
      return false;
    }

    return fs.statSync(AUTH_SQLITE_PATH).size > 0;
  } catch {
    return false;
  }
}

function removePathRecursive(targetPath) {
  if (!fs.existsSync(targetPath)) {
    return;
  }

  fs.rmSync(targetPath, { recursive: true, force: true });
}

function applyCleanCommandBase() {
  const permissionFolders = ["owner", "admin", "member"];

  for (const folder of permissionFolders) {
    const folderPath = path.join(COMMANDS_DIR, folder);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      continue;
    }

    for (const entry of fs.readdirSync(folderPath, { withFileTypes: true })) {
      const entryPath = path.join(folderPath, entry.name);

      if (folder === "member" && entry.isFile() && entry.name === "ping.js") {
        continue;
      }

      removePathRecursive(entryPath);
    }
  }

  for (const folder of permissionFolders) {
    const folderPath = path.join(COMMANDS_DIR, folder);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
  }

  const pingPath = path.join(COMMANDS_DIR, "member", "ping.js");

  if (!fs.existsSync(pingPath)) {
    throw new Error(
      "Base limpa falhou: member/ping.js não foi encontrado no projeto.",
    );
  }

  writeCleanMenu();
}

function writeCleanMenu() {
  const menuPath = path.join(__dirname, "..", "menu.js");

  const content = `/**
 * @author Dev Gui
 */
import pkg from "../package.json" with { type: "json" };
import { BOT_NAME } from "./config.js";
import { getPrefix } from "./utils/database.js";
import { readMore } from "./utils/index.js";

export function menuMessage(groupJid) {
  const date = new Date();
  const prefix = getPrefix(groupJid);

  return \`╭━━⪩ BEM VINDO! ⪨━━\${readMore()}
▢
▢ • \${BOT_NAME}
▢ • Data: \${date.toLocaleDateString("pt-br")}
▢ • Hora: \${date.toLocaleTimeString("pt-br")}
▢ • Prefixo: \${prefix}
▢ • Versão: \${pkg.version}
▢
╰━━─「🪐」─━━

╭━━⪩ PRINCIPAL ⪨━━
▢
▢ • \${prefix}ping
▢
╰━━─「🚀」─━━

_Base limpa instalada. Adicione seus comandos em src/commands/_
\`;
}
`;

  fs.writeFileSync(menuPath, content, "utf8");
}

export async function runFirstInstallSetup() {
  if (isSetupCompleted()) {
    return;
  }

  if (hasExistingAuthSession()) {
    markSetupCompleted();
    infoLog(
      "Sessão WhatsApp já existente: setup de primeira instalação ignorado.",
    );
    return;
  }

  printStepBox(
    "🚀 Primeira instalação",
    `${chalk.white.bold("Bem-vindo ao Takeshi Bot!")}\n\n${chalk.gray("Vamos configurar o essencial antes de conectar o WhatsApp.")}`,
    "magenta",
  );

  printStepBox(
    "1/3 · Tipo de base",
    `${chalk.white.bold("O que você deseja instalar?")}\n\n${chalk.cyan("1")} - Base limpa ${chalk.gray("(sem comandos, só ping)")}\n${chalk.cyan("2")} - Base completa ${chalk.gray("(com todos os comandos)")}`,
    "blue",
  );

  const baseChoice = await askChoice(
    chalk.blue.bold("Escolha (1 ou 2): "),
    ["1", "2"],
  );

  let useFullBase = baseChoice === "2";

  if (!useFullBase) {
    printStepBox(
      "⚠️ Confirmação",
      `${chalk.yellow.bold("Base limpa")}\n\nIsso remove todos os comandos de\n${chalk.white("owner / admin / member")}\nexceto ${chalk.white("member/ping.js")}.\n\n${chalk.gray("Não dá para desfazer pelo setup.")}`,
      "yellow",
    );

    const confirmClean = await askChoice(
      chalk.yellow.bold("Confirmar base limpa? (1 = Sim / 2 = Não): "),
      ["1", "2"],
    );

    if (confirmClean !== "1") {
      useFullBase = true;
      infoLog("Base limpa cancelada. Mantendo base completa.");
    } else {
      try {
        applyCleanCommandBase();
        successLog(
          "Base limpa aplicada: pastas owner/admin/member + member/ping.js.",
        );
      } catch (error) {
        errorLog(`Falha ao aplicar base limpa: ${error.message}`);
        throw error;
      }
    }
  } else {
    successLog("Base completa selecionada. Todos os comandos serão mantidos.");
  }

  if (useFullBase) {
    printStepBox(
      "2/3 · Spider X API",
      `${chalk.white.bold("Deseja configurar a Spider X API?")}\n\n${chalk.cyan("1")} - Sim\n${chalk.cyan("2")} - Não\n\n${chalk.gray("Obtenha seu token em:")}\n${chalk.blue.underline("https://api.spiderx.com.br")}`,
      "blue",
    );

    const spiderChoice = await askChoice(
      chalk.blue.bold("Escolha (1 ou 2): "),
      ["1", "2"],
    );

    if (spiderChoice === "1") {
      const spiderToken = await askToken(
        chalk.blue.bold("Cole o token da Spider X API: "),
      );
      setSpiderApiToken(spiderToken);
      successLog("Token da Spider X API salvo em database/config.json.");
    } else {
      infoLog("Spider X API não configurada agora.");
    }

    printStepBox(
      "3/3 · Linker",
      `${chalk.white.bold("Deseja configurar o Linker?")}\n\n${chalk.cyan("1")} - Sim\n${chalk.cyan("2")} - Não\n\n${chalk.gray("Obtenha sua chave de API em:")}\n${chalk.blue.underline("https://linker.devgui.dev")}\n\n${chalk.gray("Sem Linker, uploads usam o token da Spider quando houver.")}`,
      "blue",
    );

    const linkerChoice = await askChoice(
      chalk.blue.bold("Escolha (1 ou 2): "),
      ["1", "2"],
    );

    if (linkerChoice === "1") {
      const linkerKey = await askToken(
        chalk.blue.bold("Cole a API Key do Linker: "),
      );
      setLinkerApiKey(linkerKey);
      successLog("API Key do Linker salva em database/config.json.");
    } else {
      infoLog("Linker não configurado agora.");
    }
  } else {
    infoLog(
      "Base limpa: etapas de Spider X / Linker puladas. Configure depois se precisar.",
    );
  }

  markSetupCompleted();

  printStepBox(
    "✅ Setup concluído",
    `${chalk.green.bold("Configuração inicial finalizada!")}\n\n${chalk.gray("Próximo passo: parear o número do WhatsApp.")}`,
    "green",
  );
}
