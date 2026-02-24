/**
 * @author MRX
 */
import path from "path";
import { COMMANDS_DIR, PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import { readDirectoryRecursive } from "../../utils/index.js";

export default {
  name: "info",
  description: "Exibe as informações de um comando",
  commands: ["info", "info-cmd", "info-comando", "info-command"],
  usage: `${PREFIX}info <comando>`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, sendWaitReact, sendSuccessReact, args }) => {
    const commandName = args[0];

    if (!commandName) {
      throw new InvalidParameterError("Por favor, informe o nome do comando.");
    }

    await sendWaitReact();

    try {
      const commandFiles = await readDirectoryRecursive(COMMANDS_DIR);
      const cmdFile = commandFiles.find((file) => {
        const fileName = path.basename(file, path.extname(file));
        return fileName === commandName || file.includes(commandName);
      });

      if (!cmdFile) {
        throw new WarningError(`Comando "${commandName}" não encontrado.`);
      }

      const cmd = await import(cmdFile);

      const info = `*Informações do comando*\n
- *Nome:* _${cmd.default.name}_
- *Descrição:* _${cmd.default.description}_
- *Comandos:* _${cmd.default.commands.join(", ")}_
- *Uso:* _${cmd.default.usage}_
`;

      await sendSuccessReact();
      await sendReply(info);
    } catch (error) {
      throw new WarningError(`Erro ao buscar comando, ${error.message}`);
    }
  },
};
