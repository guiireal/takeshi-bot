/**
 * Ações de punição do anti-payment, compartilhadas entre o handler de mensagens
 * diretas (messageHandler) e o de marcações (quoted). A orquestração de fechar o
 * grupo, remover o autor, apagar a mensagem e limpar o chat, com deduplicação e
 * coalescência sob rajada, vive em paymentDefenseState.js.
 *
 * @author Dev Gui
 */
import { BOT_LID, OWNER_LID } from "../config.js";
import { errorLog } from "./logger.js";
import { verifyQuotedAuthor } from "./messageEnvelopeRegistry.js";
import { defendAgainstPayment } from "./paymentDefenseState.js";
import { getQuotedPaymentContext } from "./paymentMessage.js";

export function applyAntiPaymentRestriction({
  socket,
  remoteJid,
  userLid,
  messageKey,
}) {
  return defendAgainstPayment({ socket, remoteJid, userLid, messageKey });
}

export async function handleQuotedPaymentRestriction({
  socket,
  remoteJid,
  webMessage,
}) {
  const quotedPayment = getQuotedPaymentContext(webMessage);

  if (!quotedPayment?.participant) {
    return false;
  }

  const authorLid = quotedPayment.participant;

  if (authorLid === BOT_LID || authorLid === OWNER_LID) {
    return false;
  }

  const { corroborated, contradicted } = verifyQuotedAuthor({
    groupJid: remoteJid,
    stanzaId: quotedPayment.stanzaId,
    participant: authorLid,
  });

  if (!corroborated) {
    errorLog(
      `[anti-payment] Marcação não corroborada pelo registro (${
        contradicted ? "forja detectada" : "mensagem original não vista"
      }). Autor ${authorLid} preservado.`,
    );
    return false;
  }

  let authorInGroup = false;
  let authorIsAdmin = false;

  try {
    const { participants, owner } = await socket.groupMetadata(remoteJid);

    const authorParticipant = participants.find(
      (participant) => participant.id === authorLid,
    );

    authorInGroup = !!authorParticipant;
    authorIsAdmin =
      authorParticipant?.admin === "admin" ||
      authorParticipant?.admin === "superadmin" ||
      authorLid === owner;
  } catch (error) {
    errorLog(
      `Erro ao validar autor da marcação de pagamento. Detalhes: ${error.message}`,
    );
    return false;
  }

  if (!authorInGroup || authorIsAdmin) {
    return false;
  }

  await applyAntiPaymentRestriction({
    socket,
    remoteJid,
    userLid: authorLid,
    messageKey: quotedPayment.stanzaId
      ? {
          remoteJid,
          fromMe: false,
          id: quotedPayment.stanzaId,
          participant: authorLid,
        }
      : undefined,
  });

  return true;
}
