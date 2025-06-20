/**
 * Este é um modelo de comando.
 * Copie e cole este arquivo para criar um novo comando em uma das pastas: admin, member ou owner
 * Você deve renomeá-lo para ficar de fácil identificação na pasta destino.
 *
 * Pasta owner: Comandos que só podem ser executados pelo dono do grupo/bot
 * Pasta admin: Comandos que só podem ser executados por administradores do grupo
 * Pasta member: Comandos que podem ser executados por qualquer membro do grupo
 *
 * Funções e variáveis que podem ser extraídas do handle em "handle: async ({ aqui })"
 * O que você pode extrair do handle está definido em src/@types/index.d.ts
 * Cuidado, respeite letras maiúsculas e minúsculas!
 *
 * @author Dev Gui
 */
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "comando",
  description: "Descrição do comando",
  commands: ["comando1", "comando2"],
  usage: `${PREFIX}comando`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendAudioFromBuffer }) => {
    // código do comando
  },
};
