/**
 * Funções diversas.
 *
 * @author Dev Gui
 */
const { downloadContentFromMessage, delay } = require("baileys");
const { PREFIX, COMMANDS_DIR, TEMP_DIR, ASSETS_DIR } = require("../config");
const path = require("node:path");
const fs = require("node:fs");
const { writeFile } = require("fs/promises");
const readline = require("node:readline");
const axios = require("axios");
const { errorLog } = require("./logger");
const { exec } = require("node:child_process");

exports.question = (message) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => rl.question(message, resolve));
};

exports.extractDataFromMessage = (webMessage) => {
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
      replyJid: null,
      userJid: null,
    };
  }

  const isReply =
    !!extendedTextMessage && !!extendedTextMessage.contextInfo?.quotedMessage;

  const replyJid =
    !!extendedTextMessage && !!extendedTextMessage.contextInfo?.participant
      ? extendedTextMessage.contextInfo.participant
      : null;

  const userJid = webMessage?.key?.participant?.replace(
    /:[0-9][0-9]|:[0-9]/g,
    ""
  );

  const [command, ...args] = fullMessage.split(" ");
  const prefix = command.charAt(0);

  const commandWithoutPrefix = command.replace(new RegExp(`^[${PREFIX}]+`), "");

  return {
    args: this.splitByCharacters(args.join(" "), ["\\", "|", "/"]),
    commandName: this.formatCommand(commandWithoutPrefix),
    fullArgs: args.join(" "),
    fullMessage,
    isReply,
    prefix,
    remoteJid: webMessage?.key?.remoteJid,
    replyJid,
    userJid,
  };
};

exports.splitByCharacters = (str, characters) => {
  characters = characters.map((char) => (char === "\\" ? "\\\\" : char));
  const regex = new RegExp(`[${characters.join("")}]`);

  return str
    .split(regex)
    .map((str) => str.trim())
    .filter(Boolean);
};

exports.formatCommand = (text) => {
  return this.onlyLettersAndNumbers(
    this.removeAccentsAndSpecialCharacters(text.toLocaleLowerCase().trim())
  );
};

exports.isGroup = (remoteJid) => {
  return remoteJid.endsWith("@g.us");
};

exports.onlyLettersAndNumbers = (text) => {
  return text.replace(/[^a-zA-Z0-9]/g, "");
};

exports.removeAccentsAndSpecialCharacters = (text) => {
  if (!text) return "";

  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

exports.baileysIs = (webMessage, context) => {
  return !!this.getContent(webMessage, context);
};

exports.getContent = (webMessage, context) => {
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
};

exports.download = async (webMessage, fileName, context, extension) => {
  const content = this.getContent(webMessage, context);

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
};

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

exports.findCommandImport = (commandName) => {
  const command = this.readCommandImports();

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
          .map((cmdName) => this.formatCommand(cmdName))
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
};

exports.readCommandImports = () => {
  const subdirectories = fs
    .readdirSync(COMMANDS_DIR, { withFileTypes: true })
    .filter((directory) => directory.isDirectory())
    .map((directory) => directory.name);

  const commandImports = {};

  for (const subdir of subdirectories) {
    const subdirectoryPath = path.join(COMMANDS_DIR, subdir);

    const files = readDirectoryRecursive(subdirectoryPath)
      .map((filePath) => {
        try {
          return require(filePath);
        } catch (err) {
          console.error(`Erro ao importar ${filePath}:`, err);
          return null;
        }
      })
      .filter(Boolean);

    commandImports[subdir] = files;
  }

  return commandImports;
};

const onlyNumbers = (text) => text.replace(/[^0-9]/g, "");

function toUserJid(number) {
  return `${onlyNumbers(number)}@s.whatsapp.net`;
}

function toUserOrGroupJid(userArg) {
  const cleanArg = userArg.replace("@", "");
  return cleanArg.length > 14
    ? `${cleanArg}@lid`
    : `${cleanArg}@s.whatsapp.net`;
}

exports.toUserLid = (value) => `${onlyNumbers(value)}@lid`;

exports.getBuffer = (url, options) => {
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
};

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.readMore = () => {
  const invisibleBreak = "\u200B".repeat(950);
  return invisibleBreak;
};

function getRandomName(extension) {
  const fileName = `takeshi_temp_${getRandomNumber(0, 999999)}`;

  if (!extension) {
    return fileName.toString();
  }

  return `${fileName}.${extension}`;
}

exports.removeFileWithTimeout = (filePath, timeout = 5000) => {
  setTimeout(() => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error("Erro ao remover arquivo:", error);
    }
  }, timeout);
};

exports.ajustAudioByBuffer = async (audioBuffer, isPtt = true) => {
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
};

exports.getImageBuffer = async (url, options = {}) => {
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
};

exports.randomDelay = async () => {
  const values = [1000, 2000, 3000];
  return await delay(values[getRandomNumber(0, values.length - 1)]);
};

exports.isAtLeastMinutesInPast = (timestamp, minimumMinutes = 5) => {
  const currentTimestamp = Math.floor(Date.now() / 1000);

  const diffInSeconds = currentTimestamp - timestamp;

  const diffInMinutes = Math.floor(diffInSeconds / 60);

  return diffInMinutes >= minimumMinutes;
};

exports.getLastTimestampCreds = () => {
  const credsJson = JSON.parse(
    fs.readFileSync(
      path.resolve(ASSETS_DIR, "auth", "baileys", "creds.json"),
      "utf-8"
    )
  );

  return credsJson.lastAccountSyncTimestamp;
};

const normalizeNumber = (number) => {
  if (!number.startsWith("55")) {
    return number;
  }

  const withoutCountryCode = number.slice(2);
  const ddd = withoutCountryCode.slice(0, 2);
  const phoneNumber = withoutCountryCode.slice(2);

  if (phoneNumber.length === 9) {
    const withoutNinthDigit = phoneNumber.slice(1);
    return {
      with9: `55${ddd}${phoneNumber}`,
      without9: `55${ddd}${withoutNinthDigit}`,
    };
  }

  if (phoneNumber.length === 8) {
    const withNinthDigit = `9${phoneNumber}`;
    return {
      with9: `55${ddd}${withNinthDigit}`,
      without9: `55${ddd}${phoneNumber}`,
    };
  }

  return { with9: number, without9: number };
};

exports.compareUserJidWithOtherNumber = ({ userJid, otherNumber }) => {
  if (!userJid || !otherNumber) {
    return false;
  }

  if (!otherNumber.startsWith("55")) {
    return userJid === toUserJid(otherNumber);
  }

  const userNumber = onlyNumbers(userJid);
  const userVariations = normalizeNumber(userNumber);
  const ownerVariations = normalizeNumber(otherNumber);

  return (
    userVariations.with9 === ownerVariations.with9 ||
    userVariations.with9 === ownerVariations.without9 ||
    userVariations.without9 === ownerVariations.with9 ||
    userVariations.without9 === ownerVariations.without9
  );
};

exports.getRandomNumber = getRandomNumber;
exports.getRandomName = getRandomName;
exports.onlyNumbers = onlyNumbers;
exports.toUserJid = toUserJid;
exports.toUserOrGroupJid = toUserOrGroupJid;

exports.GROUP_PARTICIPANT_ADD = 27;
exports.GROUP_PARTICIPANT_LEAVE = 32;
exports.isAddOrLeave = [27, 32];
