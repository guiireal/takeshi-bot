/**
 * Ações de punição do anti-payment, compartilhadas entre o handler de mensagens
 * diretas (messageHandler) e o de marcações (quoted). A orquestração de fechar o
 * grupo, remover o autor, apagar a mensagem e limpar o chat — com deduplicação e
 * coalescência sob rajada — vive em paymentDefenseState.js.
 *
 * @author Dev Gui
 */
import { errorLog } from "./logger.js";
import { BOT_LID, OWNER_LID } from "../config.js";
import { getQuotedPaymentContext } from "./paymentMessage.js";
import { verifyQuotedAuthor } from "./messageEnvelopeRegistry.js";
import { defendAgainstPayment } from "./paymentDefenseState.js";

export function applyAntiPaymentRestriction({
  socket,
  remoteJid,
  userLid,
  messageKey,
}) {
  return defendAgainstPayment({ socket, remoteJid, userLid, messageKey });
}

/**
 * Anti-payment por marcação (quoted): quando um membro responde/cita uma
 * mensagem de pagamento (inclusive as ocultas para admins), identificamos o
 * AUTOR ORIGINAL da mensagem citada e o removemos — nunca quem citou.
 *
 * Travas anti-forja (o Takeshi não tem level/staff): só age contra autor que
 * NÃO é o bot/dono, que está PRESENTE no grupo e que NÃO é admin. Uma marcação
 * forjada apontando para admin/dono ou para quem já saiu do grupo é ignorada.
 *
 * @returns {Promise<boolean>} true se o autor original foi removido.
 */
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

  // Anti-forja: a marcação só é confiável se o bot tiver realmente recebido a
  // mensagem original (mesmo autor) e ela for pagamento ou indecifrável. Se for
  // forjada (autor diferente / conteúdo legível não-pagamento) ou se o bot nunca
  // viu o original, NÃO punimos.
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

  // A revogação da mensagem original entra como messageKey, para rodar em
  // paralelo com a remoção do autor dentro da defesa.
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
