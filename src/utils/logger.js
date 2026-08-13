/**
 * Logs
 *
 * @author Dev Gui
 */
import chalk from "chalk";
import gradient from "gradient-string";
import pkg from "../../package.json" with { type: "json" };

const bannerGradient = gradient(["#60A5FA", "#3B82F6", "#818CF8"]);

/**
 * Largura do terminal atual. Em ambientes sem TTY (ex.: saída redirecionada
 * para arquivo) `columns` é `undefined`; assume-se 80 nesse caso.
 */
export function getTerminalWidth() {
  return process.stdout.columns || 80;
}

let consoleNoiseFilterInstalled = false;

export function installConsoleNoiseFilter() {
  if (consoleNoiseFilterInstalled) {
    return;
  }

  const originalConsoleInfo = console.info.bind(console);

  console.info = (...args) => {
    if (args[0] === "Closing session:") {
      warningLog(
        "O WhatsApp fechou uma sessão criptografada antiga para renovar as chaves. Isso é um aviso normal da conexão e não indica erro no bot.",
      );
      return;
    }

    if (args[0] === "Removing old closed session:") {
      warningLog(
        "O WhatsApp removeu uma sessão criptografada antiga já fechada. Isso é limpeza normal do histórico de chaves e não indica erro no bot.",
      );
      return;
    }

    originalConsoleInfo(...args);
  };

  consoleNoiseFilterInstalled = true;
}

export function sayLog(message) {
  console.log("\x1b[36m[TAKESHI BOT | TALK]\x1b[0m", message);
}

export function inputLog(message) {
  console.log("\x1b[30m[TAKESHI BOT | INPUT]\x1b[0m", message);
}

export function infoLog(message) {
  console.log("\x1b[34m[TAKESHI BOT | INFO]\x1b[0m", message);
}

export function successLog(message) {
  console.log("\x1b[32m[TAKESHI BOT | SUCCESS]\x1b[0m", message);
}

export function errorLog(message) {
  console.log("\x1b[31m[TAKESHI BOT | ERROR]\x1b[0m", message);
}

export function warningLog(message) {
  console.log("\x1b[33m[TAKESHI BOT | WARNING]\x1b[0m", message);
}

const BANNER_ART = [
  "░▀█▀░█▀█░█░█░█▀▀░█▀▀░█░█░▀█▀░░█▀▄░█▀█░▀█▀",
  "░░█░░█▀█░█▀▄░█▀▀░▀▀█░█▀█░░█░░░█▀▄░█░█░░█░",
  "░░▀░░▀░▀░▀░▀░▀▀▀░▀▀▀░▀░▀░▀▀▀░░▀▀░░▀▀▀░░▀░",
];

const BANNER_MIN_WIDTH = 48;

export function bannerLog() {
  const subtitle = chalk.gray("🤖 Bot de WhatsApp multifunções");
  const version = chalk.gray("Versão ") + chalk.white.bold(pkg.version);

  if (getTerminalWidth() < BANNER_MIN_WIDTH) {
    console.log(bannerGradient("🤖 TAKESHI BOT"));
    console.log(`${subtitle}\n${version}\n`);
    return;
  }

  const art = BANNER_ART.map((line) => bannerGradient(line)).join("\n");
  console.log(`${art}\n\n${subtitle}  ${chalk.gray("•")}  ${version}\n`);
}
