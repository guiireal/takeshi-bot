import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { setLinkerApiKey } from "../../utils/database.js";

export default {
  name: "set-linker-token",
  description: "Mudo a API Key do Linker",
  commands: [
    "set-linker-token",
    "set-linker-api-key",
    "altera-linker-token",
    "alterar-linker-token",
    "muda-linker-token",
    "mudar-linker-token",
    "linker-token",
    "linker-api-key",
  ],
  usage: `${PREFIX}set-linker-token sua_chave_aqui`,
  handle: async ({ args, sendSuccessReply }) => {
    if (!args.length) {
      throw new InvalidParameterError(
        "Você deve fornecer a API Key do Linker!\n\nObtenha em: https://linker.devgui.dev",
      );
    }

    if (args[0].length < 4 || args[0].length > 64) {
      throw new InvalidParameterError(
        "A API Key do Linker deve ter entre 4 e 64 caracteres!",
      );
    }

    setLinkerApiKey(args[0]);

    await sendSuccessReply("API Key do Linker alterada com sucesso!");
  },
};
