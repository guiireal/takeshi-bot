import { PREFIX } from "../../../config.js";

export default {
  name: "raw-message",
  description: "Obtem dados brutos da mensagem",
  commands: ["raw-message", "raw"],
  usage: `${PREFIX}raw-message`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ webMessage, sendReply }) => {
    await sendReply(JSON.stringify(webMessage, null, 2));
  },
};
