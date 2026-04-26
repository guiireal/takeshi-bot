import { PREFIX } from "../../../config.js";
import { InvalidParameterError } from "../../../errors/index.js";

const TRIGGERS = {
  opcao1: {
    origem: "Botões simples",
    destino: "Opção 1 do exemplo de botões simples",
  },
  opcao2: {
    origem: "Botões simples",
    destino: "Opção 2 do exemplo de botões simples",
  },
  respostarapida: {
    origem: "Botões de template",
    destino: "Resposta rápida do template button",
  },
  interativo1: {
    origem: "Botões interativos",
    destino: "Botão interativo 1",
  },
  interativo2: {
    origem: "Botões interativos",
    destino: "Botão interativo 2",
  },
  legado1: {
    origem: "Botões legados",
    destino: "Botão legado 1",
  },
  legado2: {
    origem: "Botões legados",
    destino: "Botão legado 2",
  },
  imagem: {
    origem: "Lista de exemplos",
    destino: "Item Imagem",
  },
  video: {
    origem: "Lista de exemplos",
    destino: "Item Vídeo",
  },
  audio: {
    origem: "Lista de exemplos",
    destino: "Item Áudio",
  },
  botoes: {
    origem: "Lista de exemplos",
    destino: "Item Botões",
  },
  carrossel: {
    origem: "Lista de exemplos",
    destino: "Item Carrossel",
  },
};

function normalizeTrigger(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export default {
  name: "exemplo-gatilho",
  description: "Mostra qual botão ou item de lista acionou o comando",
  commands: ["exemplo-gatilho", "gatilho-exemplo"],
  usage: `${PREFIX}exemplo-gatilho <parâmetro>`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ fullArgs, prefix, sendReact, sendReply }) => {
    const parametro = fullArgs?.trim() || "";

    if (!parametro) {
      throw new InvalidParameterError(
        `Informe o parâmetro. Exemplo: ${prefix || PREFIX}exemplo-gatilho opcao1`,
      );
    }

    const trigger = TRIGGERS[normalizeTrigger(parametro)];

    await sendReact("🎯");

    if (!trigger) {
      await sendReply(
        "🎯 *Gatilho recebido*\n\n" +
          `• Parâmetro: \`${parametro}\`\n` +
          "• Status: não mapeado\n\n" +
          "Esse comando recebeu o clique corretamente. Agora você pode mapear esse parâmetro para a ação desejada.",
      );
      return;
    }

    await sendReply(
      "🎯 *Gatilho recebido*\n\n" +
        `• Origem: ${trigger.origem}\n` +
        `• Parâmetro: \`${parametro}\`\n` +
        `• Destino: ${trigger.destino}\n\n` +
        "Esse é o ponto onde você coloca a lógica que deve acontecer quando o usuário toca no botão ou item da lista.",
    );
  },
};
