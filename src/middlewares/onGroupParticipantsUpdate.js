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
  userJid,
  remoteJid,
  socket,
  action,
}) => {
  try {
    if (!remoteJid.endsWith("@g.us")) {
      return;
    }

    if (isActiveWelcomeGroup(remoteJid) && action === "add") {
      const { buffer, profileImage } = await getProfileImageData(
        socket,
        userJid
      );

      if (spiderAPITokenConfigured) {
        try {
          const link = await catBoxUpload(buffer);

          if (!link) {
            throw new Error("Link inválido");
          }

          const url = welcome(
            "participante",
            "Você é o mais novo membro do grupo!",
            link
          );

          await socket.sendMessage(remoteJid, {
            image: { url },
            caption: `Seja bem vindo ao nosso grupo, @${onlyNumbers(userJid)}!`,
            mentions: [userJid],
          });
        } catch (error) {
          console.error("Erro ao fazer upload da imagem:", error);
          await socket.sendMessage(remoteJid, {
            image: buffer,
            caption: `Seja bem vindo ao nosso grupo, @${onlyNumbers(userJid)}!`,
            mentions: [userJid],
          });
        }
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
    } else if (isActiveExitGroup(remoteJid) && action === "remove") {
      const { buffer, profileImage } = await getProfileImageData(
        socket,
        userJid
      );

      if (spiderAPITokenConfigured) {
        try {
          const link = await catBoxUpload(buffer);

          if (!link) {
            throw new Error("Link inválido");
          }

          const url = exit("membro", "Você foi um bom membro", link);

          await socket.sendMessage(remoteJid, {
            image: { url },
            caption: `Tchau, @${onlyNumbers(userJid)}!`,
            mentions: [userJid],
          });
        } catch (error) {
          console.error("Erro ao fazer upload da imagem:", error);
          await socket.sendMessage(remoteJid, {
            image: buffer,
            caption: `Tchau, @${onlyNumbers(userJid)}!`,
            mentions: [userJid],
          });
        }
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
  } catch (error) {
    console.error("Erro ao processar evento onGroupParticipantsUpdate:", error);
    process.exit(1);
  }
};
