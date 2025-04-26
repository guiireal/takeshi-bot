/**
 * Este script é responsável
 * por carregar os eventos
 * que serão escutados pelo
 * socket do WhatsApp.
 *
 * @author Dev Gui
 */
const { TIMEOUT_IN_MILLISECONDS_BY_EVENT } = require("./config");
const { onMessagesUpsert } = require("./middlewares/onMesssagesUpsert");
const path = require("path");
const { errorLog } = require("./utils/logger");

exports.load = (socket, groupCache) => {
  global.BASE_DIR = path.resolve(__dirname);

  const safeEventHandler = async (callback, data, eventName) => {
    try {
      await callback(data);
    } catch (error) {
      errorLog(`Erro ao processar evento ${eventName}: ${error.message}`);
    }
  };

  socket.ev.on("messages.upsert", async (data) => {
    setTimeout(() => {
      safeEventHandler(
        () =>
          onMessagesUpsert({
            socket,
            messages: data.messages,
            groupCache,
          }),
        data,
        "messages.upsert"
      );
    }, TIMEOUT_IN_MILLISECONDS_BY_EVENT);
  });

  process.on("uncaughtException", (error) => {
    errorLog(`Erro não capturado: ${error.message}`);
  });

  process.on("unhandledRejection", (reason) => {
    errorLog(`Promessa rejeitada não tratada: ${reason}`);
  });
};
