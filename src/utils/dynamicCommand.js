/**
 * Direcionador
 * de comandos.
 *
 * @author Dev Gui
 */
import { BOT_EMOJI, ONLY_GROUP_ID } from "../config.js";
import {
  DangerError,
  InvalidParameterError,
  WarningError,
} from "../errors/index.js";
import {
  checkPermission,
  hasTypeAndCommand,
  isAdmin,
  isBotOwner,
  isLink,
  verifyPrefix,
} from "../middlewares/index.js";
import { processAutoSticker } from "../services/sticker.js";
import { badMacHandler } from "./badMacHandler.js";
import {
  getAutoResponderResponse,
  getPrefix,
  isActiveAntiLinkGroup,
  isActiveAutoResponderGroup,
  isActiveAutoStickerGroup,
  isActiveGroup,
  isActiveOnlyAdmins,
} from "./database.js";
import { findCommandImport } from "./index.js";
import { errorLog } from "./logger.js";

/**
 * @param {CommandHandleProps} paramsHandler
 * @param {number} startProcess
 */
export async function dynamicCommand(paramsHandler, startProcess) {
  const {
    commandName,
    fullMessage,
    prefix,
    remoteJid,
    sendErrorReply,
    sendReact,
    sendReply,
    sendWarningReply,
    socket,
    userLid,
    webMessage,
  } = paramsHandler;

  const activeGroup = isActiveGroup(remoteJid);

  if (activeGroup && isActiveAntiLinkGroup(remoteJid) && isLink(fullMessage)) {
    if (!userLid) {
      return;
    }

    if (!(await isAdmin({ remoteJid, userLid, socket }))) {
      await socket.groupParticipantsUpdate(remoteJid, [userLid], "remove");

      await sendReply(
        "Anti-link ativado! Você foi removido por enviar um link!",
      );

      await socket.sendMessage(remoteJid, {
        delete: {
          remoteJid,
          fromMe: false,
          id: webMessage.key.id,
          participant: webMessage.key.participant,
        },
      });

      return;
    }
  }

  if (activeGroup && isActiveAutoStickerGroup(remoteJid)) {
    const processed = await processAutoSticker(paramsHandler);

    if (processed) {
      return;
    }
  }

  const { type, command } = await findCommandImport(commandName);

  if (ONLY_GROUP_ID && ONLY_GROUP_ID !== remoteJid) {
    return;
  }

  if (activeGroup) {
    if (
      !verifyPrefix(prefix, remoteJid) ||
      !hasTypeAndCommand({ type, command })
    ) {
      if (isActiveAutoResponderGroup(remoteJid)) {
        const response = getAutoResponderResponse(fullMessage);

        if (response) {
          await sendReply(response);
        }
      }

      if (fullMessage.toLocaleLowerCase().includes("prefixo")) {
        await sendReact(BOT_EMOJI);
        const groupPrefix = getPrefix(remoteJid);
        await sendReply(
          `O padrão é: ${groupPrefix}\nUse ${groupPrefix}menu para ver os comandos disponíveis!`,
        );
      }

      return;
    }

    if (!(await checkPermission({ type, ...paramsHandler }))) {
      await sendErrorReply(
        "Você não tem permissão para executar este comando!",
      );
      return;
    }

    if (
      isActiveOnlyAdmins(remoteJid) &&
      !(await isAdmin({ remoteJid, userLid, socket }))
    ) {
      await sendWarningReply(
        "Somente administradores podem executar comandos!",
      );
      return;
    }
  }

  if (!isBotOwner({ userLid }) && !activeGroup) {
    if (
      verifyPrefix(prefix, remoteJid) &&
      hasTypeAndCommand({ type, command })
    ) {
      if (command.name !== "on") {
        await sendWarningReply(
          "Este grupo está desativado! Peça para o dono do grupo ativar o bot!",
        );
        return;
      }

      if (!(await checkPermission({ type, ...paramsHandler }))) {
        await sendErrorReply(
          "Você não tem permissão para executar este comando!",
        );
        return;
      }
    } else {
      return;
    }
  }

  if (!verifyPrefix(prefix, remoteJid)) {
    return;
  }

  const groupPrefix = getPrefix(remoteJid);

  if (fullMessage === groupPrefix) {
    await sendReact(BOT_EMOJI);
    await sendReply(
      `Este é meu prefixo! Use ${groupPrefix}menu para ver os comandos disponíveis!`,
    );

    return;
  }

  if (!hasTypeAndCommand({ type, command })) {
    await sendWarningReply(
      `Comando não encontrado! Use ${groupPrefix}menu para ver os comandos disponíveis!`,
    );

    return;
  }

  try {
    await command.handle({
      ...paramsHandler,
      type,
      startProcess,
    });
  } catch (error) {
    if (badMacHandler.handleError(error, `command:${command?.name}`)) {
      await sendWarningReply(
        "Erro temporário de sincronização. Tente novamente em alguns segundos.",
      );
      return;
    }

    if (badMacHandler.isSessionError(error)) {
      errorLog(
        `Erro de sessão durante execução de comando ${command?.name}: ${error.message}`,
      );
      await sendWarningReply(
        "Erro de comunicação. Tente executar o comando novamente.",
      );
      return;
    }

    if (error instanceof InvalidParameterError) {
      await sendWarningReply(`Parâmetros inválidos! ${error.message}`);
    } else if (error instanceof WarningError) {
      await sendWarningReply(error.message);
    } else if (error instanceof DangerError) {
      await sendErrorReply(error.message);
    } else if (error.isAxiosError) {
      const messageText = error.response?.data?.message || error.message;
      const url = error.config?.url || "URL não disponível";

      const isSpiderAPIError = url.includes("api.spiderx.com.br");

      await sendErrorReply(
        `Ocorreu um erro ao executar uma chamada remota para ${
          isSpiderAPIError ? "a Spider X API" : url
        } no comando ${command.name}!
      
📄 *Detalhes*: ${messageText}`,
      );
    } else {
      errorLog("Erro ao executar comando", error);
      await sendErrorReply(
        `Ocorreu um erro ao executar o comando ${command.name}!
      
📄 *Detalhes*: ${error.message}`,
      );
    }
  }
}
