/**
 * Desenvolvido por: Mkg
 * Refatorado por: Dev Gui
 *
 * @author Dev Gui
 */
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { toUserJidOrLid } = require(`${BASE_DIR}/utils`);

module.exports = {
  name: "fake-chat",
  description: "Cria uma citação falsa mencionando um usuário",
  commands: ["fake-chat", "fq", "fake-quote", "f-quote", "fk"],
  usage: `${PREFIX}fake-chat @usuário / texto citado / mensagem que será enviada`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ remoteJid, socket, args }) => {
    if (args.length !== 3) {
      throw new InvalidParameterError(
        `Uso incorreto do comando. Exemplo: ${PREFIX}fake-chat @usuário / texto citado / mensagem que será enviada`
      );
    }

    const quotedText = args[1];
    const responseText = args[2];

    const mentionedJid = toUserJidOrLid(args[0]);

    if (quotedText.length < 2) {
      throw new InvalidParameterError(
        "O texto citado deve ter pelo menos 2 caracteres."
      );
    }

    if (responseText.length < 2) {
      throw new InvalidParameterError(
        "A mensagem de resposta deve ter pelo menos 2 caracteres."
      );
    }

    const fakeQuoted = {
      key: {
        fromMe: false,
        participant: mentionedJid,
        remoteJid,
      },
      message: {
        extendedTextMessage: {
          text: quotedText,
          contextInfo: {
            mentionedJid: [mentionedJid],
          },
        },
      },
    };

    await socket.sendMessage(
      remoteJid,
      { text: responseText },
      { quoted: fakeQuoted }
    );
  },
};
