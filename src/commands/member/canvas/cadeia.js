import fs from "node:fs";
import { PREFIX } from "../../../config.js";
import { DangerError, InvalidParameterError } from "../../../errors/index.js";
import { canvas } from "../../../services/spider-x-api.js";
import { upload } from "../../../services/upload.js";
import { getRandomNumber } from "../../../utils/index.js";

export default {
  name: "cadeia",
  description:
    "Gero uma montagem como se a pessoa estivesse na cadeia com a imagem que você enviar",
  commands: ["cadeia", "jail"],
  usage: `${PREFIX}cadeia (marque a imagem) ou ${PREFIX}cadeia (responda a imagem)`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    isImage,
    downloadImage,
    sendSuccessReact,
    sendWaitReact,
    sendErrorReply,
    sendImageFromURL,
    webMessage,
  }) => {
    if (!isImage) {
      throw new InvalidParameterError(
        "Você precisa marcar uma imagem ou responder a uma imagem"
      );
    }

    await sendWaitReact();

    const fileName = getRandomNumber(10_000, 99_999).toString();
    const filePath = await downloadImage(webMessage, fileName);

    const buffer = fs.readFileSync(filePath);
    const link = await upload(buffer, `${fileName}.png`);

    if (!link) {
      throw new DangerError(
        "Não consegui fazer o upload da imagem, tente novamente mais tarde!"
      );
    }

    const url = canvas("jail", link);

    const response = await fetch(url);

    if (!response.ok) {
      const data = await response.json();

      await sendErrorReply(
        `Ocorreu um erro ao executar uma chamada remota para a Spider X API no comando cadeia!
      
📄 *Detalhes*: ${data.message}`
      );
      return;
    }

    await sendSuccessReact();

    await sendImageFromURL(url, "Imagem gerada!");

    fs.unlinkSync(filePath);
  },
};
