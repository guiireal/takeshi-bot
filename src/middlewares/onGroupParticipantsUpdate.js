/**
 * Evento chamado quando um usuário
 * entra ou sai de um grupo de WhatsApp.
 *
 * @author Dev Gui
 */
const { getProfileImageData } = require("../services/baileys");
const fs = require("fs");
const { onlyNumbers } = require("../utils");
const {
  isActiveWelcomeGroup,
  isActiveExitGroup,
} = require("../utils/database");

const { catBoxUpload } = require("../services/catbox");
const {
  spiderAPITokenConfigured,
  exit,
  welcome,
} = require("../services/spider-x-api");

exports.onGroupParticipantsUpdate = async ({
  groupParticipantsUpdate,
  socket,
}) => {
  const remoteJid = groupParticipantsUpdate.id;
  const userJid = groupParticipantsUpdate.participants[0];

  if (!isActiveWelcomeGroup(remoteJid) || !isActiveExitGroup(remoteJid)) {
    return;
  }

  if (groupParticipantsUpdate.action === "add") {
    const { buffer, profileImage } = await getProfileImageData(socket, userJid);

    if (spiderAPITokenConfigured()) {
      const link = await catBoxUpload(buffer);

      const url = welcome(
        "Membro",
        "Você é o mais novo membro do grupo!",
        link
      );

      await socket.sendMessage(remoteJid, {
        image: { url },
        caption: `Seja bem vindo ao nosso grupo, @${onlyNumbers(userJid)}!`,
        mentions: [userJid],
      });
    } else {
      await socket.sendMessage(remoteJid, {
        image: buffer,
        caption: `Seja bem vindo ao nosso grupo, @${onlyNumbers(userJid)}!`,
        mentions: [userJid],
      });
    }

    if (!profileImage.includes("default-user")) {
      fs.unlinkSync(profileImage);
    }
  } else if (groupParticipantsUpdate.action === "remove") {
    const { buffer, profileImage } = await getProfileImageData(socket, userJid);

    if (spiderAPITokenConfigured()) {
      const link = await catBoxUpload(buffer);
      const url = exit("Adeus!", "Você foi um bom membro", link);

      await socket.sendMessage(remoteJid, {
        image: { url },
        caption: `Tchau, @${onlyNumbers(userJid)}!`,
        mentions: [userJid],
      });
    } else {
      await socket.sendMessage(remoteJid, {
        image: buffer,
        caption: `Tchau, @${onlyNumbers(userJid)}!`,
        mentions: [userJid],
      });
    }

    if (!profileImage.includes("default-user")) {
      fs.unlinkSync(profileImage);
    }
  }
};
