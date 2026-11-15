import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { specialTts } from "../../../services/spider-x-api.js";

export default {
  name: "voz-bolsonaro",
  description: "Gera um áudio com a voz de IA do Bolsonaro (até 512 caracteres).",
  commands: ["vozbolsonaro", "bolsonarovoz", "voicebolsonaro", "bolsonarovoice"],
  usage: `${PREFIX}vozbolsonaro <texto>`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ fullArgs, sendWaitReply, sendSuccessReact, sendAudioFromBuffer }) => {
    const text = fullArgs.trim();

    if (!text) {
      throw new InvalidParameterError(`Informe o texto. Exemplo: ${PREFIX}vozbolsonaro Olá, tudo bem?`);
    }

    await sendWaitReply("Gerando áudio...");
    const audio = await specialTts(text, "bolsonaro");
    await sendAudioFromBuffer(audio, true);
    await sendSuccessReact();
  },
};
