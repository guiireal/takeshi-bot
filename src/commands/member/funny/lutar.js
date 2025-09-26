const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { toUserOrGroupJid, onlyNumbers } = require(`${BASE_DIR}/utils`);
const path = require("node:path");
const { ASSETS_DIR } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "lutar",
  description: "Lute um mano a mano ou bata no seu inimigo!",
  commands: ["lutar", "luta"],
  usage: `${PREFIX}lutar @usuario`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    sendGifFromFile,
    sendErrorReply,
    userJid,
    replyJid,
    args,
    isReply,
  }) => {
    if (!args.length && !isReply) {
      throw new InvalidParameterError(
        "Você precisa mencionar ou marcar um membro!"
      );
    }

    const targetJid = isReply ? replyJid : toUserOrGroupJid(args[0]);

    if (!targetJid) {
      await sendErrorReply(
        "Você precisa mencionar um usuário ou responder uma mensagem para lutar."
      );

      return;
    }

    const userNumber = onlyNumbers(userJid);
    const targetNumber = onlyNumbers(targetJid);

    await sendGifFromFile(
      path.resolve(ASSETS_DIR, "images", "funny", "sung-jin-woo-jinwoo.mp4"),
      `@${userNumber} teve uma luta intensa com @${targetNumber}!`,
      [userJid, targetJid]
    );
  },
};
