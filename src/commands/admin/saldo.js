import axios from "axios";
import { PREFIX, SPIDER_API_BASE_URL, SPIDER_API_TOKEN } from "../../config.js";
import { DangerError } from "../../errors/index.js";

export default {
  name: "saldo",
  description: "Consulta o saldo de requests restantes da Spider X API",
  commands: ["saldo", "balance"],
  usage: `${PREFIX}saldo`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendSuccessReply }) => {
    const response = await axios.get(
      `${SPIDER_API_BASE_URL}/saldo?api_key=${SPIDER_API_TOKEN}`
    );

    if (!response.data.success) {
      throw new DangerError(`Erro ao consultar saldo! ${response.message}`);
    }

    const { plan, requests_left, end_date } = response.data;
    const [year, month, day] = end_date.split("-");
    await sendSuccessReply(`🤖 *Saldo da Spider X API*
      
📦 *Plano:* ${plan}
🔢 *Requests restantes:* ${requests_left}
📅 *Validade do plano:* ${day}/${month}/${year}`);
  },
};
