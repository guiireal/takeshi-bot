/**
 * Ação de punição do anti-payment, compartilhada entre o handler de mensagens
 * decifráveis (messageHandler): fecha o grupo, remove o autor, limpa o chat e reabre.
 *
 * @author Dev Gui
 */
import { sendCleanChat } from "./cleanChat.js";
import { errorLog } from "./logger.js";
import { BOT_LID, OWNER_LID } from "../config.js";
import { getQuotedPaymentContext } from "./paymentMessage.js";
import { verifyQuotedAuthor } from "./messageEnvelopeRegistry.js";

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

  if (quotedPayment.stanzaId) {
    await runAntiPaymentStep(
      () =>
        socket.sendMessage(remoteJid, {
          delete: {
            remoteJid,
            fromMe: false,
            id: quotedPayment.stanzaId,
            participant: authorLid,
          },
        }),
      "Erro ao apagar a mensagem original de pagamento.",
    );
  }

  await applyAntiPaymentRestriction({ socket, remoteJid, userLid: authorLid });

  return true;
}
