/**
 * Define o número do proprietário do bot
 * Este comando deve estar disponível para membros do grupo, pois como é a
 * primeira configuração necessária para o bot funcionar, o proprietário
 * pode não estar definido ainda.
 *
 * @author Dev Gui
 */
const {
  setOwnerNumber,
  getOwnerNumber,
  getOwnerLid,
  setOwnerLid,
} = require(`${BASE_DIR}/utils/database`);
const { onlyNumbers } = require(`${BASE_DIR}/utils`);
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError, WarningError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "set-owner-number",
  description: "Mudo o número do proprietário do bot",
  commands: [
    "set-owner-number",
    "altera-numero-dono",
    "altera-owner-number",
    "alterar-numero-dono",
    "alterar-owner-number",
    "muda-numero-dono",
    "muda-owner-number",
    "mudar-numero-dono",
    "mudar-owner-number",
    "numero-dono",
    "owner-number",
    "set-numero-dono",
  ],
  usage: `${PREFIX}set-owner-number +55 9999999999`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    args,
    sendSuccessReply,
    socket,
    userJid,
    sendWaitReact,
  }) => {
    if (!args.length) {
      throw new InvalidParameterError("Você deve fornecer um número válido!");
    }

    if (args[0].length < 9 || args[0].length > 18) {
      throw new WarningError("O número deve ter entre 9 e 18 caracteres!");
    }

    await sendWaitReact();

    const ownerNumber = getOwnerNumber();

    if (ownerNumber && ownerNumber === onlyNumbers(args[0])) {
      throw new WarningError(
        "O número fornecido já é o número do proprietário do bot!"
      );
    }

    if (ownerNumber) {
      const ownerLid = getOwnerLid();
      if (
        ownerLid &&
        ![onlyNumbers(ownerNumber), onlyNumbers(ownerLid)].includes(
          onlyNumbers(userJid)
        )
      ) {
        throw new WarningError(
          "Apenas o proprietário atual do bot pode alterar o número do proprietário!"
        );
      }
    }

    const newNumber = onlyNumbers(args[0]);
    const [result] = await socket.onWhatsApp(newNumber);
    const lid = result?.lid;

    setOwnerNumber(newNumber);

    let lidMessage = "";

    if (lid) {
      setOwnerLid(lid);
      lidMessage = `\nLID: ${lid}`;
    }

    await sendSuccessReply(
      `Número do proprietário do bot alterado com sucesso!

Novo número: ${newNumber}${lidMessage}

Configuração salva em: \`database/config.json\`

Caso ela esteja vazia, será considerado o arquivo \`src/config.js\` como fonte de configuração.`
    );
  },
};
