/**
 * Antídoto contra "stealth payment" (evasão do anti-payment).
 *
 * Contexto da técnica:
 *   Alguns atacantes usam uma Baileys modificada para enviar a mensagem de
 *   pagamento (requestPaymentMessage) retendo a sender key / pre-keys de alvos
 *   específicos (admins e o bot) e/ou forçando o atributo `decrypt-fail=hide`.
 *   Resultado: a mensagem fica VISÍVEL para os membros escolhidos, porém
 *   INVISÍVEL para admins/bot — que recebem apenas um stub indecifrável
 *   (messageStubType = CIPHERTEXT). Como o conteúdo nunca é descriptografado,
 *   o anti-payment tradicional (que inspeciona `message`) nunca dispara.
 *
 * Como detectamos:
 *   A Baileys foi editada diretamente em
 *   `node_modules/baileys/lib/Socket/messages-recv.js` (procure por
 *   "STEALTH ANTIDOTE") para anexar `webMessage.stealthMeta` ao stub
 *   indecifrável, expondo o atributo cru `decrypt-fail` e o tipo de enc.
 *   Aqui classificamos o sinal e, quando suspeito, aplicamos a MESMA punição
 *   do anti-payment (fecha grupo, remove o autor, limpa o chat e reabre).
 *
 * @author Dev Gui
 */
import { proto } from "baileys";
import { BOT_LID, OWNER_LID } from "../config.js";
import { readGroupRestrictions } from "../utils/database.js";
import { applyAntiPaymentRestriction } from "./antiPaymentAction.js";
import { errorLog, warningLog } from "./logger.js";

const CIPHERTEXT_STUB = proto?.WebMessageInfo?.StubType?.CIPHERTEXT ?? 2;

const REPEAT_WINDOW_MS = 2 * 60 * 1000;
const REPEAT_THRESHOLD = 3;
const ALERT_COOLDOWN_MS = 5 * 60 * 1000;
const TRACKER_TTL_MS = 10 * 60 * 1000;

const tracker = new Map();
let lastSweep = Date.now();

function sweep(now) {
  if (now - lastSweep < TRACKER_TTL_MS) {
    return;
  }
  lastSweep = now;
  for (const [key, entry] of tracker) {
    if (now - entry.windowStart > TRACKER_TTL_MS) {
      tracker.delete(key);
    }
  }
}

function registerFailure(trackerKey, now) {
  let entry = tracker.get(trackerKey);
  if (!entry || now - entry.windowStart > REPEAT_WINDOW_MS) {
    entry = { count: 0, windowStart: now, lastAlertAt: 0 };
  }
  entry.count += 1;
  tracker.set(trackerKey, entry);
  return entry;
}

function isOnCooldown(entry, now) {
  return entry.lastAlertAt && now - entry.lastAlertAt < ALERT_COOLDOWN_MS;
}

function classifyConfidence(webMessage, repeatCount) {
  const meta = webMessage?.stealthMeta;

  if (meta?.decryptFail === "hide") {
    return "high";
  }

  if (repeatCount >= REPEAT_THRESHOLD) {
    return "medium";
  }

  return null;
}

function shortJid(jid) {
  if (!jid) {
    return "desconhecido";
  }
  return jid.split("@")[0].split(":")[0];
}

function buildActionNotice(confidence, sender) {
  const number = shortJid(sender);

  const detail =
    confidence === "high"
      ? "tentou enviar uma cobrança *oculta e indecifrável* de forma direcionada (técnica usada para esconder pagamentos de admins e do bot)."
      : "enviou *várias mensagens indecifráveis* seguidas (possível cobrança oculta direcionada).";

  return `🚨 *Anti-Payment (Stealth)*
━━━━━━━━━━━━━━━━━━━━━━
Removi @${number}: ${detail}`;
}

async function senderIsExempt({ socket, remoteJid, sender }) {
  if (sender === OWNER_LID || sender === BOT_LID) {
    return true;
  }
  try {
    const { participants, owner } = await socket.groupMetadata(remoteJid);
    const participant = participants.find((p) => p.id === sender);
    if (!participant) {
      return false;
    }
    const isOwner = sender === owner || participant.admin === "superadmin";
    const isAdmin = participant.admin === "admin";
    return isOwner || isAdmin;
  } catch (error) {
    warningLog(
      `[stealth-payment] Falha ao obter metadados de ${remoteJid}: ${error.message}`,
    );
    return false;
  }
}

export async function handleStealthPaymentDetection({ socket, webMessage }) {
  try {
    const key = webMessage?.key;
    if (!key || key.fromMe) {
      return;
    }

    const remoteJid = key.remoteJid;
    if (!remoteJid?.endsWith("@g.us")) {
      return;
    }

    const isCiphertext = webMessage.messageStubType === CIPHERTEXT_STUB;
    const hasStealthMeta = !!webMessage.stealthMeta;
    if (!isCiphertext && !hasStealthMeta) {
      return;
    }

    const sender = key.participant;
    if (!sender) {
      return;
    }

    const restrictions = readGroupRestrictions();
    if (!restrictions[remoteJid]?.["anti-payment"]) {
      return;
    }

    const now = Date.now();
    sweep(now);

    const trackerKey = `${remoteJid}|${sender}`;
    const entry = registerFailure(trackerKey, now);

    const confidence = classifyConfidence(webMessage, entry.count);
    if (!confidence) {
      return;
    }

    if (isOnCooldown(entry, now)) {
      return;
    }

    if (await senderIsExempt({ socket, remoteJid, sender })) {
      return;
    }

    // Marca antes de agir: stubs do mesmo envio escalonado chegam quase juntos;
    // o cooldown evita banir/avisar em duplicidade enquanto a ação roda.
    entry.lastAlertAt = now;
    tracker.set(trackerKey, entry);

    warningLog(
      `[stealth-payment] Suspeita (${confidence}) em ${remoteJid} | autor ${sender} | ` +
        `decryptFail=${webMessage.stealthMeta?.decryptFail ?? "n/a"} | ` +
        `enc=${webMessage.stealthMeta?.encType ?? "n/a"} | ocorrências=${entry.count}`,
    );

    // Mesma punição do anti-payment: fecha, remove, limpa o chat e reabre.
    await applyAntiPaymentRestriction({ socket, remoteJid, userLid: sender });

    // Aviso enviado DEPOIS da limpeza para sobreviver ao clean chat.
    await socket.sendMessage(remoteJid, {
      text: buildActionNotice(confidence, sender),
      mentions: [sender],
    });
  } catch (error) {
    errorLog(`[stealth-payment] Erro ao processar detecção: ${error.message}`);
  }
}
