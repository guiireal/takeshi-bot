import { delay } from "baileys";
import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { pinterest } from "../../../services/spider-x-api.js";
import { errorLog } from "../../../utils/logger.js";

export default {
  name: "pinterest",
  description: "Busco imagens no Pinterest e envio separadamente.",
  commands: ["pinterest", "pin"],
  usage: `${PREFIX}pinterest gatos fofos`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    fullArgs,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReply,
    sendImageFromURL,
  }) => {
    if (!fullArgs.length) {
      throw new InvalidParameterError(
        "Você precisa me dizer o que deseja buscar no Pinterest!",
      );
    }

    await sendWaitReact();

    try {
      const data = await pinterest(fullArgs.trim());

      if (!Array.isArray(data) || !data.length) {
        await sendErrorReply("Nenhuma imagem foi encontrada para a sua busca.");
        return;
      }

      const images = data
        .filter((item) => typeof item?.url === "string" && item.url.length)
        .slice(0, 3);

      if (!images.length) {
        await sendErrorReply(
          "Não foi possível enviar as imagens retornadas.",
        );
        return;
      }

      await sendSuccessReact();

      for (const [index, image] of images.entries()) {
        await sendImageFromURL(
          image.url,
          `📌 Resultado ${index + 1} para: ${fullArgs}`,
        );

        if (index < images.length - 1) {
          await delay(500);
        }
      }
    } catch (error) {
      errorLog(JSON.stringify(error, null, 2));
      await sendErrorReply(JSON.stringify(error.message));
    }
  },
};
