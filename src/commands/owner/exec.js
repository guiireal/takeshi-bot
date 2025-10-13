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
  "mkfs",
  "fdisk",
  "parted",
  "format",
  "halt",
  "poweroff",
  "reboot",
  "shutdown",
  "init 0",
  "init 6",
];

const DANGEROUS_PATTERNS = [
  /:\(\)\s*\{/i,
  /rm\s+-rf\s+\/($|\s)/i,
  /rm\s+-rf\s+~\/\*/i,
  /rm\s+-rf\s+\*($|\s)/i,
  /dd\s+.*of=\/dev\/sd[a-z]/i,
  /mkfs\.[a-z]+\s+\/dev/i,
  /:\(\)\s*\{.*fork/i,
  /curl.*\|\s*bash/i,
  /wget.*\|\s*bash/i,
  /curl.*\|\s*sh/i,
  /wget.*\|\s*sh/i,
  /chmod\s+777\s+\//i,
  /chown\s+.*\s+\//i,
  />\s*\/dev\/sd[a-z]/i,
];

function isSafeCommand(command) {
  const trimmedCommand = command.trim();
  const lowerCommand = trimmedCommand.toLowerCase();

  for (const dangerous of DANGEROUS_COMMANDS) {
    if (lowerCommand.includes(dangerous.toLowerCase())) {
      return {
        safe: false,
        reason: `Comando perigoso detectado: ${dangerous}`,
      };
    }
  }

  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(trimmedCommand)) {
      return {
        safe: false,
        reason: `Padrão perigoso detectado: operação destrutiva bloqueada`,
      };
    }
  }

  return { safe: true };
}

module.exports = {
  name: "exec",
  description: "Executa comandos do terminal diretamente pelo bot.",
  commands: ["exec"],
  usage: `${PREFIX}exec comando
  
Apenas comandos destrutivos do sistema são bloqueados (formatação, shutdown, fork bombs, etc).

Exemplos permitidos: 
- ls, pwd, cat arquivo.txt
- npm install, yarn add, pnpm install
- git status, git pull, git commit
- node script.js, python arquivo.py
- rm arquivo.txt, mv origem destino
- chmod 755 script.sh
- mkdir, touch, cp, etc.`,
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

Execute qualquer comando do terminal. 
Apenas operações destrutivas críticas são bloqueadas (formatação de disco, shutdown, fork bombs, etc).`
      );
    }

    const safetyCheck = isSafeCommand(fullArgs);
    if (!safetyCheck.safe) {
      throw new DangerError(
        `⛔ Comando bloqueado por segurança!

Motivo: ${safetyCheck.reason}

Este comando pode causar danos críticos ao sistema.`
      );
    }

    console.log(`[EXEC_AUDIT] ${userJid} executou comando: ${fullArgs}`);

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
