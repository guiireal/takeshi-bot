import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { horoscope } from "../../../services/spider-x-api.js";

export default {
  name: "horoscopo",
  description: "Envia a imagem do signo com a previsão semanal.",
  commands: ["horoscopo", "signo"],
  usage: `${PREFIX}horoscopo câncer`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ fullArgs, sendWaitReact, sendImageFromURL, sendSuccessReact }) => {
    const sign = fullArgs.trim();

    if (!sign) {
      throw new InvalidParameterError("Você precisa informar o seu signo!");
    }

    await sendWaitReact();
    const { image, text } = await horoscope(sign);
    await sendImageFromURL(image, text);
    await sendSuccessReact();
  },
};
