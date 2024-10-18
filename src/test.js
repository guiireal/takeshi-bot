const {
  sayLog,
  inputLog,
  errorLog,
  warningLog,
  successLog,
  bannerLog,
  infoLog,
} = require("./utils/logger");

(async () => {
  bannerLog();
  sayLog("Olá, eu sou o Takeshi Bot!");
  inputLog("Digite algo para eu repetir:");
  const message = "Olá, eu sou o Takeshi Bot!";
  infoLog(message);
  successLog(message);
  errorLog(message);
  warningLog(message);
})();
