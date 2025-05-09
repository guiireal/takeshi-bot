// O comando a seguir só ira funcionar se seu bot estar no PM2, caso contrario, ele vai dar crash.

const { exec } = require("child_process");
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "reiniciar",
  description: "Reinicia o bot",
  commands: ["reiniciar", "restart", "reboot"],
  usage: `${PREFIX}reiniciar`,
  handle: async ({ sendReply, sendSuccessReact }) => {
    await sendReply("Reiniciando o bot...");
    await sendSuccessReact();

    setTimeout(() => {
      exec("pm2 restart botzaph || npm run start", (err, stdout, stderr) => {
        if (err) {
          console.error("Erro ao reiniciar:", err);
          return;
        }
        console.log("Bot reiniciado com sucesso!");
      });
    }, 1000);
  },
};