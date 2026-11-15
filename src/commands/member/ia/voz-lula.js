import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { specialTts } from "../../../services/spider-x-api.js";

export default {
  name: "voz-lula",
  description: "Gera um áudio com a voz de IA do Lula (até 512 caracteres).",
  commands: ["vozlula", "lulavoz", "voicelula", "lulavoice"],
  usage: `${PREFIX}vozlula <texto>`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ fullArgs, sendWaitReply, sendSuccessReact, sendAudioFromURL }) => {
    const text = fullArgs.trim();

    if (!text) {
      throw new InvalidParameterError(`Informe o texto. Exemplo: ${PREFIX}vozlula Olá, tudo bem?`);
    }

    await sendWaitReply("Gerando áudio...");
    const audioUrl = await specialTts(text, "lula");
    await sendAudioFromURL(audioUrl, true);
    await sendSuccessReact();
  },
};
