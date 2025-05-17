const { PREFIX } = require(`${BASE_DIR}/config`);
const { download } = require(`${BASE_DIR}/services/spider-x-api`);
const { WarningError, InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "tik-tok",
  description: "Faço o download de vídeos do TikTok",
  commands: ["tik-tok", "ttk"],
  usage: `${PREFIX}tik-tok https://www.tiktok.com/@yrrefutavel/video/7359413022483287301`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    sendVideoFromURL,
    fullArgs,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReply,
  }) => {
    if (!fullArgs.length) {
      throw new InvalidParameterError("Você precisa enviar uma URL do TikTok!");
    }

    await sendWaitReact();

    if (!fullArgs.includes("tiktok")) {
      throw new WarningError("O link não é do TikTok!");
    }

    try {
      const data = await download("tik-tok", fullArgs);

      if (!data) {
        await sendErrorReply("Nenhum resultado encontrado!");
        return;
      }

      await sendSuccessReact();

      await sendVideoFromURL(data.download_link);
    } catch (error) {
      console.log(error);
      await sendErrorReply(error.message);
    }
  },
};
