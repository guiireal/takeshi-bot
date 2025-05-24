const { performance } = require('perf_hooks');
const { PREFIX } = require(`${BASE_DIR}/config`);
const { formatUptime } = require(`${BASE_DIR}/utils/formatTime`);


module.exports = {
  name: "ping",
  description: "Verifica se estou online e tempo de atividade",
  commands: ["ping", "pong"],
  usage: `${PREFIX}ping`,
  handle: async ({ sendReply, sendReact, commandName }) => {
    try {
      const startTime = performance.now();
      await sendReact("🏓");
      const endTime = performance.now();
      
      const pingTime = endTime - startTime;
      const uptime = formatUptime(process.uptime());
      
      const [value, unit] = pingTime < 1 ? 
        [pingTime.toFixed(3), 'ms'] : 
        [(pingTime / 1000).toFixed(3), 's'];
      
      const pingPongText = commandName === "ping" ? "Pong!" : "Ping!";
      
      await sendReply(
        `🏓 ${pingPongText}\n\n` +
        `⏱️ *Online ah*: ${uptime}\n` +
        `⚡ *Tempo de resposta*: ${value} ${unit}`
      );
    } catch (error) {
      console.error('Erro no comando ping:', error);
      await sendReply('❌ Ocorreu um erro ao verificar meu status.');
    }
  },
};
