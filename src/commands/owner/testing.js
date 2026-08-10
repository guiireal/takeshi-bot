import { PREFIX } from "../../config.js";

export default {
  name: "testing",
  description: "Comando de testes",
  commands: ["testing", "teste"],
  usage: `${PREFIX}testing`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ socket, remoteJid, webMessage }) => {
    await socket.sendMessage(
      remoteJid,
      {
        video: { url: "https://linker.devgui.dev/l/AH5eJgwY.mp4" },
        mimetype: "video/mp4",
        gifPlayback: true,
        caption: "Teste",
      },
      {
        quoted: webMessage,
      },
    );
  },
};
