/*
 * Se você clicou aqui é porque provavelmente já usou um bot de "case" e com um "index.js" de 20 mil linhas...
 * Eu sei, eu entendo você!
 * O que é melhor? Dar erro no seu play, você ir no arquivo "play.js" e corrigir
 * ou ir na linha 71023 do "index.js" e corrigir?
 *
 * Imagina se vc cola sua "case" errado e esquece de fechar
 * ou abrir um parênteses, uma chave...
 * Você põe o bot pra rodar, dá vários erros e você não sabe resolver...
 * Adivinha o que você faz?
 * Você volta "a index.js" pra que estava antes, não é verdade?
 *
 * É isso que não queremos! Queremos um código limpo, legível e de fácil manutenção!
 * Nós criamos código para humanos, não para máquinas, então, quanto mais simples, melhor!
 *
 * A partir de agora, vamos trocar a palavra "case" por "comando", ok? Vamos lá!
 *
 * ---------------- 🤖 ONDE ESTÃO OS COMANDOS? 🤖 ----------------
 *
 * Você encontra os comandos dentro da pasta "src/commands"
 * Não entendeu? Vamos lá:
 *
 * Abra a pasta "src"
 * Depois, abra a pasta "commands"
 *
 * Perceba que dentro dela tem 3 pastas:
 *
 * - 📁 admin
 * - 📁 member
 * - 📁 owner
 *
 * Dentro da pasta admin tem comandos administrativos.
 * Dentro da pasta member tem comandos para membros.
 * Dentro da pasta owner tem comandos que são acessados somente pelo dono do bot/grupo!
 *
 * Simples, não é mesmo? Ah, detalhe, não precisa colocar um "if" para saber se o comando é de admin ou de dono.
 * O bot já faz isso para você! Basta colocar o comando na pasta correspondente!
 *
 * O arquivo 🤖-como-criar-comandos.js é um gabarito para você copiar e colar no seu comando!
 *
 * ---------------- 🤖 ONDE MODIFICO O MENU? 🤖 ----------------
 *
 * Abra a pasta "src"
 * Vá no arquivo "menu.js" e edite o menu!
 * Só lembrando, faça tudo dentro das crases (`), pois é um template string!
 *
 * Não entendeu?
 * Veja:
 *
 * `Olá tudo bem?` - Isto está CORRETO ✅
 *
 * Olá `tudo bem?` - Isto está ERRADO (veja que o "Olá" está fora das crases) ❌
 *
 * ---------------- 🤖 COMO TROCO A FOTO DO BOT? 🤖 ----------------
 *
 * Abra a pasta "assets"
 * Depois, abra a pasta "images"
 * Substitua a imagem "takeshi-bot.png" por outra de sua preferência!
 * Só não esqueça de manter o nome "takeshi-bot.png"
 *
 * Ou se preferir, digite <prefixo>set-menu-image mencionando
 * imagem que deseja definir como foto do menu.
 *
 * ---------------- 🚀 IMPORTANTE 🚀 ----------------
 *
 * Leia o tutorial completo em: https://github.com/guiireal/takeshi-bot?tab=readme-ov-file#instala%C3%A7%C3%A3o-no-termux-
 *
 * Não pule etapas! Leia-o completo, pois ele é muito importante para você entender como o bot funciona!
 *
 * By: Dev Gui
 *
 * Não modifique nada abaixo, a não ser que saiba o que está fazendo!
 */
import { connect } from "./connection.js";
import { load } from "./loader.js";
import { badMacHandler } from "./utils/badMacHandler.js";
import { bannerLog, errorLog, infoLog, warningLog } from "./utils/logger.js";
import {
  startDashboard,
  updateBotStats,
  setBotConnected,
} from "./services/dashboard.js";
import {
  countCommandFiles,
  countGroups,
  countMutedUsers,
  countAutoResponders,
} from "./utils/statsHelper.js";

process.on("uncaughtException", (error) => {
  if (badMacHandler.handleError(error, "uncaughtException")) {
    return;
  }

  errorLog(`Erro crítico não capturado: ${error.message}`);
  errorLog(error.stack);

  if (
    !error.message.includes("ENOTFOUND") &&
    !error.message.includes("timeout")
  ) {
    process.exit(1);
  }
});

process.on("unhandledRejection", (reason) => {
  if (badMacHandler.handleError(reason, "unhandledRejection")) {
    return;
  }

  errorLog(`Promessa rejeitada não tratada:`, reason);
});

async function startBot() {
  try {
    process.setMaxListeners(1500);

    bannerLog();
    infoLog("Iniciando meus componentes internos...");

    const stats = badMacHandler.getStats();
    if (stats.errorCount > 0) {
      warningLog(
        `BadMacHandler stats: ${stats.errorCount}/${stats.maxRetries} erros`,
      );
    }

    const socket = await connect();

    // Iniciar Dashboard
    startDashboard(3000);

    // Atualizar estatísticas
    updateBotStats({
      totalCommands: countCommandFiles(),
      totalGroups: countGroups(),
      mutedUsers: countMutedUsers(),
      autoResponders: countAutoResponders(),
    });

    setBotConnected(true);

    load(socket);

    setInterval(() => {
      const currentStats = badMacHandler.getStats();
      if (currentStats.errorCount > 0) {
        warningLog(
          `BadMacHandler stats: ${currentStats.errorCount}/${currentStats.maxRetries} erros`,
        );
      }

      // Atualizar estatísticas a cada 5 minutos
      updateBotStats({
        totalCommands: countCommandFiles(),
        totalGroups: countGroups(),
        mutedUsers: countMutedUsers(),
        autoResponders: countAutoResponders(),
      });
    }, 300_000);
  } catch (error) {
    if (badMacHandler.handleError(error, "bot-startup")) {
      warningLog("Erro Bad MAC durante inicialização, tentando novamente...");

      setTimeout(() => {
        startBot();
      }, 5000);
      return;
    }

    errorLog(`Erro ao iniciar o bot: ${error.message}`);
    errorLog(error.stack);
    process.exit(1);
  }
}

startBot();
