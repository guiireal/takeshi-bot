import { PREFIX } from "../../config.js";
import { InvalidParameterError, WarningError } from "../../errors/index.js";
import { updatePlanUser } from "../../services/spider-x-api.js";

export default {
  name: "plano-bores-host",
  description: "Atribui o plano da Bores Host na Spider X API",
  commands: ["plano-bores-host"],
  usage: `${PREFIX}plano-bores-host fulano@email.com`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, sendSuccessReply, sendErrorReply }) => {
    if (!args.length) {
      throw new InvalidParameterError("Email não fornecido");
    }

    const email = args[0].trim();

    if (!email.includes("@")) {
      throw new WarningError("Email inválido!");
    }

    try {
      await updatePlanUser(email, "Diamond Bores Host");

      await sendSuccessReply(
        `Plano Diamond da parceria Bores Host atribuído com sucesso ao usuário ${email}!`
      );
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;

      await sendErrorReply(`Não foi possível atualizar o plano do usuário!
        
Motivo: ${errorMessage}`);
    }
  },
};
