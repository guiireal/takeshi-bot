import path from "node:path";
import { ASSETS_DIR, PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";
import { onlyNumbers } from "../../../utils/index.js";

export default {
  name: "socar",
  description: "Bate em um usuário com um soco.",
  commands: ["socar", "soca", "soco", "socao"],
  usage: `${PREFIX}socar @usuario`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    sendGifFromFile,
    sendErrorReply,
    userLid,
    replyLid,
    args,
    isReply,
  }) => {
    if (!args.length && !isReply) {
      throw new InvalidParameterError(
        "Você precisa mencionar ou marcar um membro!"
      );
    }

    const targetLid = isReply
      ? replyLid
      : args[0]
      ? `${onlyNumbers(args[0])}@lid`
      : null;

    if (!targetLid) {
      await sendErrorReply(
        "Você precisa mencionar um usuário ou responder uma mensagem para socar."
      );

      return;
    }

    const userNumber = onlyNumbers(userLid);
    const targetNumber = onlyNumbers(targetLid);

    await sendGifFromFile(
      path.resolve(
        ASSETS_DIR,
        "images",
        "funny",
        "some-guy-getting-punch-anime-punching-some-guy-anime.mp4"
      ),
      `@${userNumber} deu um soco bombástico em @${targetNumber}!`,
      [userLid, targetLid]
    );
  },
};
