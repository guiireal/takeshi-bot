import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";
import { setProxy } from "../../services/spider-x-api.js";

export default {
  name: "set-proxy",
  description: "Troca a proxy da Spider X API",
  commands: ["set-proxy"],
  usage: `${PREFIX}set-proxy <nova_proxy>`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ args, sendSuccessReply, sendWaitReact, sendErrorReply }) => {
    if (!args?.length) {
      throw new InvalidParameterError(`Você precisa fornecer uma proxy válida!
        
- 1-proxy6
- 2-proxy6
- 3-proxy6
- 4-proxy6
- 5-proxy6
- 6-proxy6
- enigma`);
    }

    await sendWaitReact();

    const result = await setProxy(args[0].trim());

    if (!result) {
      await sendErrorReply(`Não foi possível definir a proxy! Tente novamente!
        
Proxies disponíveis

- 1-proxy6
- 2-proxy6
- 3-proxy6
- 4-proxy6
- 5-proxy6
- 6-proxy6
- enigma`);

      return;
    }

    await sendSuccessReply("Proxy definida com sucesso na Spider X API!");
  },
};
