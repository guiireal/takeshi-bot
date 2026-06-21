/**
 * Logs
 *
 * @author Dev Gui
 */
import pkg from "../../package.json" with { type: "json" };

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

export function bannerLog() {
  console.log(`\x1b[36m░▀█▀░█▀█░█░█░█▀▀░█▀▀░█░█░▀█▀░░█▀▄░█▀█░▀█▀\x1b[0m`);
  console.log(`░░█░░█▀█░█▀▄░█▀▀░▀▀█░█▀█░░█░░░█▀▄░█░█░░█░`);
  console.log(`\x1b[36m░░▀░░▀░▀░▀░▀░▀▀▀░▀▀▀░▀░▀░▀▀▀░░▀▀░░▀▀▀░░▀░\x1b[0m`);
  console.log(`\x1b[36m🤖 Versão: \x1b[0m${pkg.version}\n`);
}
