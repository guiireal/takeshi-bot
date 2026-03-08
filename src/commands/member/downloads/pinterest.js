import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { pinterest } from "../../../services/spider-x-api.js";
import { errorLog } from "../../../utils/logger.js";

export default {
  name: "pinterest",
  description: "Busco imagens no Pinterest e envio em formato carrossel.",
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
    socket,
    remoteJid,
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

      const cards = data
        .filter((item) => typeof item?.url === "string" && item.url.length)
        .slice(0, 5)
        .map((item, index) => ({
          title: `📌 Resultado ${index + 1}`,
          image: {
            url: item.url,
          },
          caption: `Busca: ${fullArgs}`,
        }));

      if (!cards.length) {
        await sendErrorReply(
          "Não foi possível montar o carrossel com as imagens retornadas.",
        );
        return;
      }

      await sendSuccessReact();

      await socket.sendMessage(remoteJid, {
        text: `📌 Resultados do Pinterest para: ${fullArgs}`,
        footer: "Deslize para ver as imagens →",
        cards,
        viewOnce: true,
      });
    } catch (error) {
      errorLog(JSON.stringify(error, null, 2));
      await sendErrorReply(JSON.stringify(error.message));
    }
  },
};
