const { exec } = require("child_process");

module.exports = {
  name: "exec",
  description: "Executa comandos do terminal diretamente pelo bot.",
  commands: ["exec"],
  usage: "~exec <comando>",
  handle: async ({ fullArgs, sendReply, sendErrorReply }) => {
    if (!fullArgs) {
      return await sendErrorReply("Uso correto: ~exec <comando>");
    }

    exec(fullArgs, (error, stdout, stderr) => {
      if (error) {
        return sendErrorReply(`Erro ao executar: ${error.message}`);
      }
      if (stderr) {
        return sendErrorReply(`Stderr: ${stderr}`);
      }

      const output = stdout || "Comando executado sem saída.";
      return sendReply(`Resultado:\n\`\`\`\n${output.trim().slice(0, 4000)}\n\`\`\``);
    });
  },
};