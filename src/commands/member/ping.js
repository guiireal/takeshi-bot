const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "ping",
  description: "Verificar se o bot está online",
  commands: ["ping"],
  usage: `${PREFIX}ping`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendReply, sendReact }) => {
    await sendReact("🏓");
    await sendReply(`🏓 Pong!`);
  },
};
