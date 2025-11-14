/**
 * Funções diversas.
 *
 * @author Dev Gui
 */
import axios from "axios";
import { delay, downloadContentFromMessage } from "baileys";
import { writeFile } from "fs/promises";
import { exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { pathToFileURL } from "node:url";
import { ASSETS_DIR, COMMANDS_DIR, PREFIX, TEMP_DIR } from "../config.js";
import { errorLog } from "./logger.js";

export function question(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => rl.question(message, resolve));
}

export function extractDataFromMessage(webMessage) {
  const textMessage = webMessage.message?.conversation;
  const extendedTextMessage = webMessage.message?.extendedTextMessage;
  const extendedTextMessageText = extendedTextMessage?.text;
  const imageTextMessage = webMessage.message?.imageMessage?.caption;
  const videoTextMessage = webMessage.message?.videoMessage?.caption;

  const fullMessage =
    textMessage ||
    extendedTextMessageText ||
    imageTextMessage ||
    videoTextMessage;

  if (!fullMessage) {
    return {
      args: [],
      commandName: null,
      fullArgs: null,
      fullMessage: null,
      isReply: false,
      prefix: null,
      remoteJid: null,
      replyLid: null,
      userLid: null,
      replyText: null,
    };
  }

  const isReply =
    !!extendedTextMessage && !!extendedTextMessage.contextInfo?.quotedMessage;

  const replyLid =
    !!extendedTextMessage && !!extendedTextMessage.contextInfo?.participant
      ? extendedTextMessage.contextInfo.participant
      : null;

  const replyTextType1 =
    extendedTextMessage?.contextInfo?.quotedMessage?.conversation;

  const replyTextType2 =
    extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text;

  const replyTextType3 =
    extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage?.caption;

  const replyText = replyTextType1 || replyTextType2 || replyTextType3 || "";

  const userLid = webMessage?.key?.participant?.replace(
    /:[0-9][0-9]|:[0-9]/g,
    ""
  );

  const [command, ...args] = fullMessage.split(" ");
  const prefix = command.charAt(0);

  const commandWithoutPrefix = command.replace(new RegExp(`^[${PREFIX}]+`), "");

  return {
    args: splitByCharacters(args.join(" "), ["\\", "|", "/"]),
    commandName: formatCommand(commandWithoutPrefix),
    fullArgs: args.join(" "),
    fullMessage,
    isReply,
    prefix,
    remoteJid: webMessage?.key?.remoteJid,
    replyLid,
    replyText,
    userLid,
  };
}

export function splitByCharacters(str, characters) {
  characters = characters.map((char) => (char === "\\" ? "\\\\" : char));
  const regex = new RegExp(`[${characters.join("")}]`);

  return str
    .split(regex)
    .map((str) => str.trim())
    .filter(Boolean);
}

export function formatCommand(text) {
  return onlyLettersAndNumbers(
    removeAccentsAndSpecialCharacters(text.toLocaleLowerCase().trim())
  );
}

export function isGroup(remoteJid) {
  return remoteJid.endsWith("@g.us");
}

export function onlyLettersAndNumbers(text) {
  return text.replace(/[^a-zA-Z0-9]/g, "");
}

export function removeAccentsAndSpecialCharacters(text) {
  if (!text) return "";

  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function baileysIs(webMessage, context) {
  return !!getContent(webMessage, context);
}

export function getContent(webMessage, context) {
  return (
    webMessage?.message?.[`${context}Message`] ||
    webMessage?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.[
      `${context}Message`
    ] ||
    webMessage?.message?.viewOnceMessage?.message?.[`${context}Message`] ||
    webMessage?.message?.extendedTextMessage?.contextInfo?.quotedMessage
      ?.viewOnceMessage?.message?.[`${context}Message`] ||
    webMessage?.message?.viewOnceMessageV2?.message?.[`${context}Message`] ||
    webMessage?.message?.extendedTextMessage?.contextInfo?.quotedMessage
      ?.viewOnceMessageV2?.message?.[`${context}Message`]
  );
}

export async function download(webMessage, fileName, context, extension) {
  const content = getContent(webMessage, context);

  if (!content) {
    return null;
  }

  const stream = await downloadContentFromMessage(content, context);

  let buffer = Buffer.from([]);

  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }

  const filePath = path.resolve(TEMP_DIR, `${fileName}.${extension}`);

  await writeFile(filePath, buffer);

  return filePath;
}

function readDirectoryRecursive(dir) {
  const results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of list) {
    const itemPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results.push(...readDirectoryRecursive(itemPath));
    } else if (
      !item.name.startsWith("_") &&
      (item.name.endsWith(".js") || item.name.endsWith(".ts"))
    ) {
      results.push(itemPath);
    }
  }

  return results;
}

export async function findCommandImport(commandName) {
  const command = await readCommandImports();

  let typeReturn = "";
  let targetCommandReturn = null;

  for (const [type, commands] of Object.entries(command)) {
    if (!commands.length) {
      continue;
    }

    try {
      const targetCommand = commands.find((cmd) => {
        if (!cmd?.commands || !Array.isArray(cmd.commands)) {
          errorLog(
            `Erro no comando do tipo "${type}": A propriedade "commands" precisa existir ser um ["array"] com os nomes dos comandos! Arquivo errado: ${cmd.name}.js`
          );

          return false;
        }

        return cmd.commands
          .map((cmdName) => formatCommand(cmdName))
          .includes(commandName);
      });

      if (targetCommand) {
        typeReturn = type;
        targetCommandReturn = targetCommand;
        break;
      }
    } catch (error) {
      console.error(`Erro ao processar comandos do tipo "${type}":`, error);
    }
  }

  return {
    type: typeReturn,
    command: targetCommandReturn,
  };
}

export async function readCommandImports() {
  const subdirectories = fs
    .readdirSync(COMMANDS_DIR, { withFileTypes: true })
    .filter((directory) => directory.isDirectory())
    .map((directory) => directory.name);

  const commandImports = {};

  await Promise.all(
    subdirectories.map(async (subdir) => {
      const subdirectoryPath = path.join(COMMANDS_DIR, subdir);

      const files = await Promise.all(
        readDirectoryRecursive(subdirectoryPath).map(async (filePath) => {
          try {
            const module = await import(pathToFileURL(filePath).href);
            return module.default ?? module;
          } catch (err) {
            console.error(`Erro ao importar ${filePath}:`, err);
            return null;
          }
        })
      );

      commandImports[subdir] = files.filter(Boolean);
    })
  );

  return commandImports;
}

export const onlyNumbers = (text) => text.replace(/[^0-9]/g, "");

export function toUserLid(value) {
  return `${onlyNumbers(value)}@lid`;
}

export function getBuffer(url, options) {
  return new Promise((resolve, reject) => {
    axios({
      method: "get",
      url,
      headers: {
        DNT: 1,
        "Upgrade-Insecure-Request": 1,
        range: "bytes=0-",
      },
      ...options,
      responseType: "arraybuffer",
      proxy: options?.proxy || false,
    })
      .then((res) => {
        resolve(res.data);
      })
      .catch(reject);
  });
}

export function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function readMore() {
  const invisibleBreak = "\u200B".repeat(950);
  return invisibleBreak;
}

export function getRandomName(extension) {
  const fileName = `takeshi_temp_${getRandomNumber(0, 999999)}`;

  if (!extension) {
    return fileName.toString();
  }

  return `${fileName}.${extension}`;
}

export function removeFileWithTimeout(filePath, timeout = 5000) {
  setTimeout(() => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error("Erro ao remover arquivo:", error);
    }
  }, timeout);
}

export async function ajustAudioByBuffer(audioBuffer, isPtt = true) {
  return new Promise((resolve, reject) => {
    const tempPath = path.resolve(
      TEMP_DIR,
      getRandomName(isPtt ? "ogg" : "mp3")
    );

    fs.writeFileSync(tempPath, audioBuffer);

    const outputPath = path.resolve(
      TEMP_DIR,
      getRandomName(isPtt ? "ogg" : "mp3")
    );

    const command = isPtt
      ? `ffmpeg -i "${tempPath}" -vn -c:a libopus -f ogg -b:a 48k -ac 1 -y "${outputPath}"`
      : `ffmpeg -i "${tempPath}" -vn -c:a libmp3lame -f mp3 -ar 44100 -ac 2 -b:a 128k -y "${outputPath}"`;

    exec(command, (error) => {
      if (error) {
        console.error(error);
        reject(error);
        return;
      }

      try {
        const result = {
          oldAudioPath: tempPath,
          audioPath: outputPath,
          audioBuffer: fs.readFileSync(outputPath),
        };
        resolve(result);
      } catch (readError) {
        reject(readError);
      }
    });
  });
}

export async function getImageBuffer(url, options = {}) {
  try {
    const defaultOptions = {
      method: "GET",
      headers: {
        Accept: "image/*",
      },
    };

    const fetchOptions = { ...defaultOptions, ...options };

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(
        `Falha ao obter imagem: ${response.status} ${response.statusText}`
      );
    }

    const buffer = await response.arrayBuffer();

    return buffer;
  } catch (error) {
    errorLog(`Erro ao obter o buffer da imagem: ${error.message}`);
    throw error;
  }
}

export async function randomDelay() {
  const values = [1000, 2000, 3000];
  return await delay(values[getRandomNumber(0, values.length - 1)]);
}

export function isAtLeastMinutesInPast(timestamp, minimumMinutes = 5) {
  const currentTimestamp = Math.floor(Date.now() / 1000);

  const diffInSeconds = currentTimestamp - timestamp;

  const diffInMinutes = Math.floor(diffInSeconds / 60);

  return diffInMinutes >= minimumMinutes;
}

export function getLastTimestampCreds() {
  const credsJson = JSON.parse(
    fs.readFileSync(
      path.resolve(ASSETS_DIR, "auth", "baileys", "creds.json"),
      "utf-8"
    )
  );

  return credsJson.lastAccountSyncTimestamp;
}

export const GROUP_PARTICIPANT_ADD = 27;
export const GROUP_PARTICIPANT_LEAVE = 32;
export const isAddOrLeave = [27, 32];
