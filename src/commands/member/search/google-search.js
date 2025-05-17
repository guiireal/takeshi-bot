const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError, WarningError } = require(`${BASE_DIR}/errors`);

const { search } = require(`${BASE_DIR}/services/spider-x-api`);

module.exports = {
  name: "google-search",
  description: "Consulta Google",
  commands: ["google-search", "g-search"],
  usage: `${PREFIX}google-search segunda guerra mundial`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ fullArgs, sendSuccessReply }) => {
    if (fullArgs.length <= 1) {
      throw new InvalidParameterError(
        "Você precisa fornecer uma pesquisa para o Google."
      );
    }

    const maxLength = 100;

    if (fullArgs.length > maxLength) {
      throw new InvalidParameterError(
        `O tamanho máximo da pesquisa é de ${maxLength} caracteres.`
      );
    }

    const data = await search("google", fullArgs);

    if (!data) {
      throw new WarningError(
        "Não foi possível encontrar resultados para a pesquisa."
      );
    }

    let text = "";

    for (const item of data) {
      text += `Título: *${item.title}*\n\n`;
      text += `Descrição: ${item.description}\n\n`;
      text += `URL: ${item.url}\n\n-----\n\n`;
    }

    text = text.slice(0, -2);

    await sendSuccessReply(`*Pesquisa realizada*

*Termo*: ${fullArgs}
      
*Resultados*
${text}`);
  },
};
