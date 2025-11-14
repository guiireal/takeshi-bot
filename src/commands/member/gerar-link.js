import fs from "node:fs";
import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { upload } from "../../services/upload.js";
import { getRandomNumber } from "../../utils/index.js";

export default {
  name: "gerar-link",
  description: "Faço upload da imagens",
  commands: ["to-link", "up", "upload", "gera-link", "gerar-link"],
  usage: `${PREFIX}gerar-link (marque a imagem) ou ${PREFIX}gerar-link (responda a imagem)`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    isImage,
    downloadImage,
    sendSuccessReact,
    sendWaitReact,
    sendReply,
    webMessage,
  }) => {
    if (!isImage) {
      throw new InvalidParameterError(
        "Você deve marcar ou responder uma imagem!"
      );
    }

    await sendWaitReact();

    const fileName = getRandomNumber(10_000, 99_999).toString();
    const filePath = await downloadImage(webMessage, fileName);

    const buffer = fs.readFileSync(filePath);

    const link = await upload(buffer, `${fileName}.png`);

    if (!link) {
      throw new Error(
        "Erro ao fazer upload da imagem. Tente novamente mais tarde."
      );
    }

    await sendSuccessReact();

    await sendReply(`Aqui está o link da sua imagem !\n\n- ${link}`);

    fs.unlinkSync(filePath);
  },
};
