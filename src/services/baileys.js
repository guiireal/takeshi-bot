/**
 * Funções reaproveitáveis
 * da biblioteca Baileys (comunicação com o WhatsApp).
 *
 * @author Dev Gui
 */
const { getBuffer, getRandomName } = require("../utils");
const fs = require("node:fs");
const path = require("node:path");
const { TEMP_DIR, ASSETS_DIR } = require("../config");

exports.getProfileImageData = async (socket, userJid) => {
  let profileImage = "";
  let buffer = null;
  let success = true;

  try {
    profileImage = await socket.profilePictureUrl(userJid, "image");

    buffer = await getBuffer(profileImage);

    const tempImage = path.resolve(TEMP_DIR, getRandomName("png"));

    fs.writeFileSync(tempImage, buffer);

    profileImage = tempImage;
  } catch (error) {
    success = false;

    profileImage = path.resolve(ASSETS_DIR, "images", "default-user.png");

    if (fs.existsSync(profileImage)) {
      buffer = fs.readFileSync(profileImage);
    }
  }

  return { buffer, profileImage, success };
};
