const { PREFIX, ASSETS_DIR } = require(`${BASE_DIR}/config`);
const { delay } = require("baileys");
const path = require("node:path");
module.exports = {
  name: "enviar-audio-de-arquivo",
  description: "Exemplo de como enviar um áudio através de um arquivo",
  commands: ["enviar-audio-de-arquivo"],
  usage: `${PREFIX}enviar-audio-de-arquivo`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendAudioFromFile, sendReact }) => {
    await sendReact("🔈");

    await delay(3000);

    await sendReply(
      "Vou enviar um áudio de um arquivo, enviarei como reprodução de arquivo."
    );

    await delay(3000);

    await sendAudioFromFile(
      path.join(ASSETS_DIR, "samples", "sample-audio.mp3")
    );

    await delay(3000);

    await sendReply(
      "Agora enviarei um áudio de um arquivo, porém como se eu tivesse gravado o áudio."
    );

    await delay(3000);

    await sendAudioFromFile(
      path.join(ASSETS_DIR, "samples", "sample-audio.mp3"),
      true
    );

    await delay(3000);

    await sendReply(
      "Agora enviarei um áudio de um arquivo, porém sem mencionar em cima da sua mensagem."
    );

    await delay(3000);

    await sendAudioFromFile(
      path.join(ASSETS_DIR, "samples", "sample-audio.mp3"),
      false,
      false
    );

    await delay(3000);

    await sendReply(
      "E por fim, enviarei um áudio de um arquivo, como se eu tivesse gravado, porém sem mencionar em cima da sua mensagem."
    );

    await delay(3000);

    await sendAudioFromFile(
      path.join(ASSETS_DIR, "samples", "sample-audio.mp3"),
      true,
      false
    );
  },
};
