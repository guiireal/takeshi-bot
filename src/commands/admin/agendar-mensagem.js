/**
 * Desenvolvido por: Mkg
 * Refatorado por: Dev Gui
 *
 * @author Dev Gui
 */
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "agendar-mensagem",
  description: "Agenda uma mensagem para ser enviada após um tempo definido.",
  commands: ["agendar", "agendar-mensagem"],
  usage: `${PREFIX}agendar-mensagem mensagem / tempo
  
Exemplo: ${PREFIX}agendar-mensagem Reunião amanhã / 10m`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ args, sendErrorReply, sendSuccessReply, sendText }) => {
    if (args.length !== 2) {
      return await sendErrorReply(
        `Formato incorreto. Use: ${PREFIX}agendar-mensagem mensagem / tempo
        
Exemplo: ${PREFIX}agendar-mensagem Reunião amanhã / 10m`
      );
    }

    const rawTime = args[1].trim();

    const message = args[0].trim();

    let timeInMs = 0;

    if (/^\d+s$/.test(rawTime)) {
      timeInMs = parseInt(rawTime) * 1000;
    } else if (/^\d+m$/.test(rawTime)) {
      timeInMs = parseInt(rawTime) * 60 * 1000;
    } else if (/^\d+h$/.test(rawTime)) {
      timeInMs = parseInt(rawTime) * 60 * 60 * 1000;
    } else {
      return await sendErrorReply(
        `Formato de tempo inválido.
Use:\n• 10s para 10 segundos\n• 5m para 5 minutos\n• 2h para 2 horas`
      );
    }

    if (!message || message.trim() === "" || isNaN(timeInMs) || timeInMs <= 0) {
      return await sendErrorReply(
        "Mensagem inválida ou tempo não especificado corretamente."
      );
    }

    await sendSuccessReply(`⌚ Mensagem agendada para daqui a ${rawTime}...`);

    setTimeout(async () => {
      await sendText(`⏰ *Mensagem agendada:*\n\n${message}`);
    }, timeInMs);
  },
};
