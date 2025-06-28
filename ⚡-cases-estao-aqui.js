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
 * ---------------- 🚀 IMPORTANTE 🚀 ----------------
 *
 * Leia o tutorial completo em: https://github.com/guiireal/takeshi-bot?tab=readme-ov-file#instala%C3%A7%C3%A3o-no-termux-
 *
 * Não pule etapas! Leia-o completo, pois ele é muito importante para você entender como o bot funciona!
 *
 * By: Dev Gui
 */
