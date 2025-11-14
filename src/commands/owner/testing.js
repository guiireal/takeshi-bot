import { PREFIX } from "../../config.js";

export default {
  name: "testing",
  description: "Comando de testes",
  commands: ["testing", "teste"],
  usage: `${PREFIX}testing`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ socket }) => {
    console.log(socket.user);
  },
};
