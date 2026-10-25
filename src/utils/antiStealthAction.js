/**
 * Defesa anti-stealth: o que fazer com uma mensagem invisível confirmada.
 *
 * A detecção (`stealthMessage.js`) só diz "o autor X mandou algo que não
 * consegui ler". Isso sozinho não é prova de nada — sessão dessincronizada
 * produz o mesmo sintoma. Por isso a punição exige RAJADA: ATTACK_THRESHOLD
 * mensagens indecifráveis do mesmo autor na janela de 30s do
 * `stealthDefenseState.js`, já descontadas as reentregas e a classe reação/pin.
 *
 * Confirmada a rajada, a ordem é: fecha o grupo, remove o autor, revoga tudo o
 * que ele mandou na janela, limpa o chat e reabre o grupo (com debounce, para
 * não piscar durante a rajada).
 *
 * Abaixo do limite, nada acontece além do log. É o mesmo princípio do
 * anti-payment: quando em dúvida, não pune.
 *
 * @author Dev Gui
 */
import { BOT_LID, OWNER_LID } from "../config.js";
import { clearChat } from "../messages.js";
import { isActiveGroupRestriction } from "./database.js";
import { deletePaymentMessageWithFallback } from "./deletePaymentMessage.js";
import { errorLog, warningLog } from "./logger.js";
import {
  isStealthAuthorHandled,
  markStealthAuthorHandled,
  registerStealthMessage,
  takeStealthMessagesToRevoke,
  touchGroupContainment,
} from "./stealthDefenseState.js";

const ATTACK_THRESHOLD = 3;
const REVOKE_BUDGET_MS = 5 * 1000;

/**
 * Fecha o grupo só se ele estiver aberto, e devolve se FOMOS nós que fechamos —
 * é o que autoriza a reabertura depois. Grupo já fechado pelos admins continua
 * fechado.
 */
async function closeGroupIfOpen(socket, groupJid) {
  try {
    const metadata = await socket.groupMetadata(groupJid);

    if (metadata.announce) {
      return false;
    }
  } catch (error) {
    warningLog(
      `[anti-stealth] Não consegui consultar o estado de ${groupJid}. Detalhes: ${error.message}`,
    );
    return false;
  }

  try {
    await socket.groupSettingUpdate(groupJid, "announcement");
    return true;
  } catch (error) {
    warningLog(
      `[anti-stealth] Não consegui fechar ${groupJid}. Detalhes: ${error.message}`,
    );
    return false;
  }
}

async function revokeMessage(socket, groupJid, messageId, author) {
  const messageKey = {
    remoteJid: groupJid,
    fromMe: false,
    id: messageId,
    participant: author,
  };

  try {
    await socket.sendMessage(groupJid, { delete: messageKey });
  } catch {
    await deletePaymentMessageWithFallback({
      socket,
      remoteJid: groupJid,
      messageKey,
      settleMs: 250,
    });
  }
}

/**
 * Revogar mensagem por mensagem pode travar num id que o WhatsApp ignora. O
 * orçamento garante que a defesa siga em frente (limpar o chat, reabrir o
 * grupo) mesmo que a fila de revogações não termine.
 */
function withTimeBudget(task, budgetMs) {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, budgetMs);

    timer.unref?.();

    task.finally(() => {
      clearTimeout(timer);
      resolve();
    });
  });
}

function isProtectedAuthor(socket, authorIds) {
  const protectedIds = [OWNER_LID, BOT_LID, socket.user?.id].filter(Boolean);

  return authorIds.some((id) => protectedIds.includes(id));
}

/**
 * Checa o cargo atual no grupo comparando TODOS os ids do autor (jid, lid e
 * telefone), porque o stanza pode trazer o autor numa forma e a metadata em
 * outra.
 */
async function isCurrentGroupAdmin(socket, groupJid, authorIds) {
  try {
    const { participants, owner } = await socket.groupMetadata(groupJid);

    const participant = participants.find((candidate) =>
      [candidate.id, candidate.jid, candidate.lid, candidate.phoneNumber]
        .filter(Boolean)
        .some((id) => authorIds.includes(id)),
    );

    if (!participant) {
      return false;
    }

    return (
      participant.admin === "admin" ||
      participant.admin === "superadmin" ||
      authorIds.includes(owner)
    );
  } catch (error) {
    warningLog(
      `[anti-stealth] Não consegui validar o cargo do autor em ${groupJid}. Detalhes: ${error.message}`,
    );
    return false;
  }
}

/**
 * @param {{
 *   socket: ReturnType<typeof import("../services/wa.js").createSocketAdapter>,
 *   detection: import("./stealthMessage.js").StealthDetection,
 * }} params
 */
export async function handleStealthDefense({ socket, detection }) {
  const { groupJid, author, messageId, authorIds } = detection;

  warningLog(
    `[anti-stealth] Falha skmsg em ${groupJid} (autor=${author ?? "?"}, id=${
      messageId ?? "?"
    }, hide=${detection.hiddenAttribute}, bytes=${
      detection.ciphertextBytes ?? "?"
    }).`,
  );

  if (!author || !messageId) {
    return;
  }

  if (!isActiveGroupRestriction(groupJid, "anti-stealth")) {
    return;
  }

  if (isProtectedAuthor(socket, authorIds)) {
    return;
  }

  if (await isCurrentGroupAdmin(socket, groupJid, authorIds)) {
    warningLog(
      `[anti-stealth] Autor ${author} preservado em ${groupJid} por ser administrador.`,
    );
    return;
  }

  const registration = registerStealthMessage({
    groupJid,
    author,
    messageId,
    hidden: detection.hiddenAttribute,
  });

  if (registration.duplicate && !registration.upgraded) {
    return;
  }

  const contain = (scheduleReopen) =>
    touchGroupContainment({
      groupJid,
      closeIfOpen: () => closeGroupIfOpen(socket, groupJid),
      reopen: async () => {
        try {
          await socket.groupSettingUpdate(groupJid, "not_announcement");
        } catch (error) {
          warningLog(
            `[anti-stealth] Não consegui reabrir ${groupJid}. Detalhes: ${error.message}`,
          );
        }
      },
      scheduleReopen,
    });

  const revoke = async (idToRevoke) => {
    try {
      await revokeMessage(socket, groupJid, idToRevoke, author);
    } catch (error) {
      warningLog(
        `[anti-stealth] Falha ao revogar ${idToRevoke} em ${groupJid}. Detalhes: ${error.message}`,
      );
    }
  };

  // Autor já contido há pouco: a rajada seguinte dele é só revogada, sem tentar
  // remover de novo (ele nem está mais no grupo).
  if (isStealthAuthorHandled({ groupJid, author })) {
    await contain(false);
    await revoke(messageId);
    await contain(true);
    return;
  }

  if (registration.visibleCount < ATTACK_THRESHOLD) {
    warningLog(
      `[anti-stealth] Falha isolada preservada em ${groupJid} (autor=${author}, ${registration.visibleCount}/${ATTACK_THRESHOLD}).`,
    );
    return;
  }

  const idsToRevoke = takeStealthMessagesToRevoke({ groupJid, author });

  markStealthAuthorHandled({ groupJid, author });

  await contain(false);

  try {
    await socket.groupParticipantsUpdate(groupJid, [author], "remove");
  } catch (error) {
    errorLog(
      `[anti-stealth] Não consegui remover ${author} de ${groupJid}. Verifique se eu sou administrador do grupo! Detalhes: ${error.message}`,
    );
  }

  await withTimeBudget(
    (async () => {
      for (const id of idsToRevoke) {
        await revoke(id);
      }
    })(),
    REVOKE_BUDGET_MS,
  );

  try {
    await socket.sendMessage(groupJid, { text: `\n\n${clearChat()}` });
  } catch (error) {
    errorLog(
      `[anti-stealth] Não consegui limpar ${groupJid}. Detalhes: ${error.message}`,
    );
  }

  await contain(true);

  warningLog(
    `[anti-stealth] Autor removido após ${registration.visibleCount} falhas skmsg em ${groupJid} (autor=${author}).`,
  );
}
