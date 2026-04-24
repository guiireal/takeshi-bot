import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";

export default {
  name: "enquete",
  description: "Cria uma enquete/votação no grupo",
  commands: ["enquete", "poll", "votação", "enquete-criar"],
  usage: `${PREFIX}enquete <título> | <opção 1> | <opção 2> | [opção 3...] [-s]\n\n💡 Dicas de uso:\n\n📌 Separar com pipe (|):\n${PREFIX}enquete Qual sua cor? | Vermelho | Azul | Verde\n\n📌 Ou com vírgula (,):\n${PREFIX}enquete Qual sua cor?, Vermelho, Azul, Verde\n\n📌 Escolha única (apenas 1 resposta):\n${PREFIX}enquete Você concorda? | Sim | Não | -s\n\n📌 Com aspas (opcional):\n${PREFIX}enquete "Qual sua cor?" "Vermelho" "Azul"`,

  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({
    fullArgs,
    sendPoll,
    sendReply,
    sendErrorReply,
    sendReact,
    isGroup,
  }) => {
    if (!isGroup) {
      throw new InvalidParameterError("Este comando só funciona em grupos!");
    }

    if (!fullArgs || fullArgs.trim().length === 0) {
      await sendReply(
        `📊 *CRIAR ENQUETE*\n\n💡 Use de qualquer uma destas formas:\n\n*Formato 1: Pipe (|)*\n${PREFIX}enquete Qual sua cor? | Vermelho | Azul | Verde\n\n*Formato 2: Vírgula (,)*\n${PREFIX}enquete Qual sua cor?, Vermelho, Azul, Verde\n\n*Formato 3: Aspas (para textos com símbolos)*\n${PREFIX}enquete "Qual sua cor?" "Vermelho 🔴" "Azul 🔵"\n\n*Escolha única (add -s no final):*\n${PREFIX}enquete Você concorda? | Sim | Não | -s\n\n⚠️ Mínimo: 2 opções | Máximo: 10 opções`,
      );
      return;
    }

    try {
      let isSingleChoice = false;
      let argsToProcess = fullArgs.trim();

      // Detectar -s no final
      if (argsToProcess.endsWith(" -s") || argsToProcess.endsWith("-s")) {
        isSingleChoice = true;
        argsToProcess = argsToProcess
          .replace(/ -s$/i, "")
          .replace(/ \| -s$/i, "")
          .trim();
      }

      let items = [];

      // Tentar parse com aspas primeiro
      if (argsToProcess.includes('"')) {
        const regex = /"([^"]*)"/g;
        let match;
        while ((match = regex.exec(argsToProcess)) !== null) {
          items.push(match[1].trim());
        }
      }

      // Se não encontrou com aspas, tenta com pipe
      if (items.length === 0 && argsToProcess.includes("|")) {
        items = argsToProcess
          .split("|")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
      }

      // Se não encontrou com pipe, tenta com vírgula
      if (items.length === 0 && argsToProcess.includes(",")) {
        items = argsToProcess
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
      }

      // Se ainda não encontrou nada, trata como um argumento único
      if (items.length === 0) {
        items = [argsToProcess];
      }

      // Validações
      if (items.length < 2) {
        await sendReply(
          `❌ Você precisa de pelo menos 1 título + 2 opções (total: mínimo 3 itens)\n\n💡 Exemplo:\n${PREFIX}enquete Qual sua cor? | Vermelho | Azul | Verde`,
        );
        return;
      }

      if (items.length > 11) {
        await sendReply(
          `❌ Máximo de 10 opções! (você forneceu ${items.length - 1} opções)\n\nDica: O primeiro item é o título!`,
        );
        return;
      }

      const [titulo, ...opcoes] = items;

      if (opcoes.length < 2) {
        await sendReply(
          `❌ Você precisa de no mínimo 2 opções (você forneceu ${opcoes.length})\n\n💡 Exemplo:\n${PREFIX}enquete Qual sua cor? | Vermelho | Azul`,
        );
        return;
      }

      // Converter opções para o formato esperado
      const optionsFormatted = opcoes.map((optionName) => ({
        optionName: optionName.trim(),
      }));

      await sendReact("📊");
      await sendPoll(titulo, optionsFormatted, isSingleChoice);
    } catch (error) {
      await sendErrorReply(`❌ Erro ao criar enquete: ${error.message}`);
    }
  },
};
