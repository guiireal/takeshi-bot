const { PREFIX } = require(`${BASE_DIR}/config`);
const { delay } = require("baileys");

module.exports = {
  name: "enviar-localizacao",
  description: "Exemplo de como enviar uma localização",
  commands: ["enviar-localizacao"],
  usage: `${PREFIX}enviar-localizacao`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendReact, sendLocation }) => {
    await sendReact("📍");

    await delay(3000);

    await sendReply("Vou enviar a localização da Praça da Sé - SP.");

    await delay(3000);

    await sendLocation(-23.55052, -46.633308);

    await delay(3000);

    await sendReply("Agora enviarei de Nova York, EUA.");

    await delay(3000);

    await sendLocation(40.712776, -74.005974);

    await delay(3000);

    await sendReply(
      "Use a função `sendLocation(latitude, longitude)` para enviar uma localização!"
    );
  },
};
