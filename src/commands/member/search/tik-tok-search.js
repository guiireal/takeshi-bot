const { PREFIX } = require(`${BASE_DIR}/config`);
const { search } = require(`${BASE_DIR}/services/spider-x-api`);

module.exports = {
  name: "tik-tok-search",
  description: "Faço pesquisas de vídeos do TikTok.",
  commands: ["tik-tok-search", "ttk-search"],
  usage: `${PREFIX}tik-tok-search termo`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    args,
    sendWaitReact,
    sendSuccessReply,
    sendWarningReply,
  }) => {
    if (!args.length) {
      await sendWarningReply("Você precisa me dizer o que pesquisar!");
      return;
    }

    const searchTerm = args[0];

    const minLength = 3;
    const maxLength = 20;

    if (searchTerm.length < minLength || searchTerm.length > maxLength) {
      await sendWarningReply(
        `O termo de pesquisa deve ter entre ${minLength} e ${maxLength} caracteres!`
      );
      return;
    }

    await sendWaitReact();

    try {
      const result = await search("tik-tok", searchTerm);

      if (!result?.data?.length) {
        await sendWarningReply(
          "Não encontrei nenhum vídeo com esse termo de pesquisa!"
        );
        return;
      }

      let resultText = "";

      for (const item of result.data) {
        const { author, video } = item;
        resultText += `*URL do vídeo:* ${video.full_url}
*Descrição:* ${video.description}
*Duração em segundos:* ${video.duration_in_seconds}s
*Autor:* ${author.nickname}
*Descrição do autor:* ${author?.signature ?? "Nenhuma"}\n\n-------------\n\n`;
      }

      await sendSuccessReply(`🔎 *Resultado da pesquisa*
        
${resultText.slice(0, -2)}`);
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
