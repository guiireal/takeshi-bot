/**
 * Ação de punição do anti-payment, compartilhada entre o handler de mensagens
 * decifráveis (messageHandler) e o detector de cobranças ocultas
 * (stealthPayment): fecha o grupo, remove o autor, limpa o chat e reabre.
 *
 * @author Dev Gui
 */
import { sendCleanChat } from "./cleanChat.js";
import { errorLog } from "./logger.js";

async function runAntiPaymentStep(step, errorMessage) {
  try {
    await step();
  } catch (error) {
    errorLog(`${errorMessage} Detalhes: ${error.message}`);
  }
}

export async function applyAntiPaymentRestriction({
  socket,
  remoteJid,
  userLid,
}) {
  await runAntiPaymentStep(
    () => socket.groupSettingUpdate(remoteJid, "announcement"),
    "Erro ao fechar o grupo pelo anti-payment.",
  );

  await runAntiPaymentStep(
    () => socket.groupParticipantsUpdate(remoteJid, [userLid], "remove"),
    "Erro ao banir membro pelo anti-payment.",
  );

  await sendCleanChat({ socket, remoteJid });

  await runAntiPaymentStep(
    () => socket.groupSettingUpdate(remoteJid, "not_announcement"),
    "Erro ao abrir o grupo pelo anti-payment.",
  );
}
