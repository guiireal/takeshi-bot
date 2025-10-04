/**
 * Desenvolvido por: Mkg
 * Refatorado por: Dev Gui
 * Proteções de segurança implementadas
 *
 * @author Dev Gui
 */
const { exec } = require("child_process");
const { isBotOwner } = require(`${BASE_DIR}/middlewares`);
const { PREFIX } = require(`${BASE_DIR}/config`);
const { DangerError } = require(`${BASE_DIR}/errors`);

const DANGEROUS_COMMANDS = [
  ":()",
  "attrib",
  "cacls",
  "chmod 777",
  "chown",
  "cp /etc",
  "dd",
  "del /f",
  "del",
  "fdisk",
  "firewall-cmd",
  "fork()",
  "format",
  "halt",
  "init",
  "iptables",
  "kill",
  "killall",
  "ln -sf",
  "mkfs",
  "mv /etc",
  "parted",
  "passwd",
  "pkill",
  "poweroff",
  "rd /s",
  "reboot",
  "rm",
  "rmdir",
  "shutdown",
  "su",
  "sudo",
  "ufw",
  "unlink",
  "yes",
];

const DANGEROUS_PATTERNS = [
  /;\s*(rm|mv|cp)\s/,
  /\/dev\/sd[a-z]/,
  /\|\s*sh/,
  /\$\(.*\)/,
  /&&\s*(rm|mv|cp)\s/,
  /`.*`/,
  />\s*\/dev\/(null|zero|random)/,
  /chmod\s+[0-7]*77/,
  /curl.*\|\s*sh/,
  /dd\s+.*of=/,
  /del\s+\/[fqs]/,
  /format\s+[a-z]:/,
  /mkfs\./,
  /rd\s+\/s/,
  /rm\s+.*\*.*\*/,
  /rm\s+(-[rf]+\s+)?\//,
  /wget.*\|\s*sh/,
];

const SAFE_COMMANDS = [
  "alias",
  "awk",
  "cat",
  "cut",
  "date",
  "df",
  "dig",
  "dir",
  "du",
  "echo",
  "env",
  "file",
  "find",
  "free",
  "git branch",
  "git config",
  "git diff",
  "git log",
  "git remote",
  "git show",
  "git status",
  "grep",
  "groups",
  "head",
  "history",
  "host",
  "htop",
  "id",
  "ipconfig",
  "jobs",
  "la",
  "less",
  "ll",
  "locate",
  "ls",
  "lsblk",
  "lsof",
  "more",
  "mount",
  "netsh interface show",
  "netstat",
  "node --version",
  "npm --version",
  "npm audit",
  "npm list",
  "npm outdated",
  "nslookup",
  "ping -c",
  "printf",
  "ps",
  "pwd",
  "sed",
  "set",
  "sort",
  "ss",
  "systeminfo",
  "tail",
  "tasklist",
  "time",
  "top",
  "tree",
  "type",
  "uname",
  "uniq",
  "uptime",
  "ver",
  "wc",
  "whereis",
  "which",
  "whoami",
];

function isSafeCommand(command) {
  const trimmedCommand = command.trim().toLowerCase();

  for (const dangerous of DANGEROUS_COMMANDS) {
    if (trimmedCommand.includes(dangerous.toLowerCase())) {
      return {
        safe: false,
        reason: `Comando proibido detectado: ${dangerous}`,
      };
    }
  }

  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(trimmedCommand)) {
      return {
        safe: false,
        reason: `Padrão perigoso detectado: ${pattern.toString()}`,
      };
    }
  }

  if (trimmedCommand.includes("..")) {
    return {
      safe: false,
      reason: "Navegação de diretório suspeita (..)",
    };
  }

  const sensitivePaths = [
    "/etc",
    "/proc",
    "/sys",
    "/dev",
    "c:\\windows",
    "c:\\system32",
  ];

  for (const path of sensitivePaths) {
    if (trimmedCommand.includes(path.toLowerCase())) {
      return {
        safe: false,
        reason: "Acesso a diretórios de sistema proibido",
      };
    }
  }

  const firstWord = trimmedCommand.split(" ")[0];
  const isExplicitlySafe = SAFE_COMMANDS.some((safeCmd) => {
    const safeCmdLower = safeCmd.toLowerCase();
    return (
      safeCmdLower.startsWith(firstWord) ||
      trimmedCommand.startsWith(safeCmdLower)
    );
  });

  if (!isExplicitlySafe) {
    return {
      safe: false,
      reason: `Comando não está na lista de comandos seguros: ${firstWord}`,
    };
  }

  return { safe: true };
}

module.exports = {
  name: "exec",
  description: "Executa comandos seguros do terminal diretamente pelo bot.",
  commands: ["exec"],
  usage: `${PREFIX}exec comando
  
Apenas comandos seguros de leitura são permitidos.

Exemplos: ls, pwd, ps, df, git status, npm list`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ fullArgs, sendSuccessReply, sendErrorReply, userJid }) => {
    if (!isBotOwner({ userJid })) {
      throw new DangerError("Apenas o dono do bot pode usar este comando!");
    }

    if (!fullArgs) {
      throw new DangerError(
        `Uso correto: ${PREFIX}exec comando

Comandos seguros incluem: ls, pwd, ps, df, git status, npm list, etc.`
      );
    }

    const safetyCheck = isSafeCommand(fullArgs);
    if (!safetyCheck.safe) {
      throw new DangerError(
        `Comando bloqueado por segurança!
Motivo: ${safetyCheck.reason}

Para sua segurança, apenas comandos de leitura são permitidos.
Comandos seguros incluem: ls, pwd, cat, ps, df, git status, etc.`
      );
    }

    console.log(`[EXEC_AUDIT] ${userJid} executou comando seguro: ${fullArgs}`);

    const timeoutMs = 15000;
    const maxBuffer = 1024 * 1024;

    exec(
      fullArgs,
      {
        timeout: timeoutMs,
        maxBuffer: maxBuffer,
      },
      (error, stdout, stderr) => {
        if (error) {
          if (error.code === "ETIMEDOUT") {
            return sendErrorReply("⏱️ Comando cancelado por timeout (15s)");
          }
          if (error.message.includes("maxBuffer")) {
            return sendErrorReply("📊 Saída muito grande, comando cancelado");
          }
          return sendErrorReply(error.message);
        }

        let output = stdout || stderr || "Comando executado sem saída.";

        const maxOutputLength = 3500;

        if (output.length > maxOutputLength) {
          output =
            output.substring(0, maxOutputLength) + "\n\n... (saída truncada)";
        }

        output = output.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

        return sendSuccessReply(
          `Resultado do comando: \`${fullArgs}\`\n\n` +
            `\`\`\`\n${output.trim()}\n\`\`\``
        );
      }
    );
  },
};
