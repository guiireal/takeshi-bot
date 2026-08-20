import axios from "axios";
import { PREFIX, SPIDER_API_BASE_URL } from "../../config.js";
import { DangerError } from "../../errors/index.js";
import { getSpiderApiToken } from "../../utils/database.js";

export default {
  name: "saldo",
  description: "Consulta o saldo de requests restantes da Spider X API",
  commands: ["saldo", "balance"],
  usage: `${PREFIX}saldo`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendSuccessReply }) => {
    const token = getSpiderApiToken();

    const response = await axios.get(
      `${SPIDER_API_BASE_URL}/saldo?api_key=${token}`,
    );

    if (!response.data.success) {
      throw new DangerError(`Erro ao consultar saldo! ${response.message}`);
    }

    const { plan, total_requests, requests_used, requests_left, end_date } =
      response.data;
    const [year, month, day] = end_date.split("-");
    const formattedTotal =
      total_requests != null
        ? Number(total_requests).toLocaleString("pt-BR")
        : "0";
    const formattedUsed =
      requests_used != null
        ? Number(requests_used).toLocaleString("pt-BR")
        : "0";
    const formattedLeft =
      requests_left != null
        ? Number(requests_left).toLocaleString("pt-BR")
        : "0";

    await sendSuccessReply(`🤖 *Saldo da Spider X API*
      
📦 *Plano:* ${plan}
📊 *Resumo:* ${formattedUsed}/${formattedTotal}
🔢 *Requests restantes:* ${formattedLeft}
📅 *Validade do plano:* ${day}/${month}/${year}`);
  },
};
