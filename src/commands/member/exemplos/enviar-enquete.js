import { delay } from "zapo-js";
import { PREFIX } from "../../../config.js";

export default {
  name: "enviar-enquete",
  description: "Exemplo de como enviar enquetes/votações em grupos",
  commands: ["enviar-enquete", "poll-example", "exemplo-poll"],
  usage: `${PREFIX}enviar-enquete`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendPoll, sendReply, sendReact }) => {
    await sendReact("📊");

    await delay(2000);

    await sendPoll(
      "Enquete de escolha única: Qual sua opção preferida?",
      [
        { optionName: "Opção 1" },
        { optionName: "Opção 2" },
        { optionName: "Opção 3" },
      ],
      true
    );

    await delay(2000);

    await sendPoll(
      "Enquete múltipla escolha: Quais comidas você gosta?",
      [
        { optionName: "Pizza 🍕" },
        { optionName: "Hambúrguer 🍔" },
        { optionName: "Sushi 🍣" },
        { optionName: "Salada 🥗" },
        { optionName: "Sorvete 🍦" },
      ],
      false
    );

    await delay(2000);

    await sendReply(
      "Você pode criar suas próprias enquetes facilmente usando a função sendPoll(title, options, singleChoice)."
    );
  },
};
