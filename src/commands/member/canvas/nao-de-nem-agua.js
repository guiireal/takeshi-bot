import fs from "node:fs";
import { PREFIX } from "../../../config.js";
import { DangerError, InvalidParameterError } from "../../../errors/index.js";
import { upload } from "../../../services/linker.js";
import { canvas } from "../../../services/spider-x-api.js";
import { getRandomNumber } from "../../../utils/index.js";

export default {
  name: "naodenemagua",
  description:
    'Coloco a imagem que você enviar, redonda e com o símbolo de proibido, no cartaz do gato do meme "Não dê nem água"',
  commands: ["naodeagua", "naodenemagua"],
  usage: `${PREFIX}naodenemagua (marque a imagem) ou ${PREFIX}naodenemagua (responda a imagem)`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    isImage,
    downloadImage,
    sendSuccessReact,
    sendWaitReact,
    sendImageFromURL,
    sendErrorReply,
    webMessage,
  }) => {
    if (!isImage) {
      throw new InvalidParameterError(
        "Você precisa marcar uma imagem ou responder a uma imagem",
      );
    }

    await sendWaitReact();

    const fileName = getRandomNumber(10_000, 99_999).toString();
    const filePath = await downloadImage(webMessage, fileName);

    try {
      const buffer = fs.readFileSync(filePath);
      const link = await upload(buffer, `${fileName}.png`);

      if (!link) {
        throw new DangerError(
          "Não consegui fazer o upload da imagem, tente novamente mais tarde!",
        );
      }

      const url = canvas("nao-de-nem-agua", link);

      const response = await fetch(url);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        await sendErrorReply(
          `Ocorreu um erro ao executar uma chamada remota para a Spider X API no comando naodenemagua!

📄 *Detalhes*: ${data.message ?? data.error ?? "erro desconhecido"}`,
        );
        return;
      }

      await sendSuccessReact();

      await sendImageFromURL(url, "Imagem gerada!");
    } finally {
      fs.unlinkSync(filePath);
    }
  },
};
