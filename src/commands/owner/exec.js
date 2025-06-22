/**
 * Desenvolvido por: Mkg
 * Refatorado por: Dev Gui
 *
 * @author Dev Gui
 */
const { exec } = require("child_process");
const { isBotOwner } = require(`${BASE_DIR}/middlewares`);
const { PREFIX } = require(`${BASE_DIR}/config`);
const { DangerError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "exec",
  description: "Executa comandos do terminal diretamente pelo bot.",
  commands: ["exec"],
  usage: `${PREFIX}exec comando`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    fullArgs,
    sendSuccessReply,
    sendErrorReply,
    userJid,
    isLid,
  }) => {
    if (!isBotOwner({ userJid, isLid })) {
      throw new DangerError("Apenas o dono do bot pode usar este comando!");
    }

    if (!fullArgs) {
      throw new DangerError(`Uso correto: ${PREFIX}exec comando`);
    }

    exec(fullArgs, (error, stdout) => {
      if (error) {
        return sendErrorReply(`Erro ao executar: ${error.message}`);
      }

      const output = stdout || "Comando executado sem saída.";

      return sendSuccessReply(
        `Resultado:\n\`\`\`\n${output.trim().slice(0, 4000)}\n\`\`\``
      );
    });
  },
};
