import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { setPrefix } from "../../utils/database.js";

export default {
  name: "set-prefix",
  description: "Mudo o prefixo de uso dos meus comandos",
  commands: [
    "set-prefix",
    "altera-prefix",
    "altera-prefixo",
    "alterar-prefix",
    "alterar-prefixo",
    "muda-prefix",
    "muda-prefixo",
    "mudar-prefix",
    "mudar-prefixo",
    "set-prefixo",
  ],
  usage: `${PREFIX}set-prefix =`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ remoteJid, args, sendSuccessReply }) => {
    if (!args.length) {
      throw new InvalidParameterError("Você deve fornecer um prefixo!");
    }
    if (args.length !== 1) {
      throw new InvalidParameterError("O prefixo deve ser apenas 1 caractere!");
    }
    const newPrefix = args[0];
    setPrefix(remoteJid, newPrefix);
    await sendSuccessReply(`Prefixo alterado para: ${newPrefix} neste grupo!`);
  },
};
