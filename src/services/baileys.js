/**
 * Funções reaproveitáveis
 * da biblioteca Baileys (comunicação com o WhatsApp).
 *
 * @author Dev Gui
 */
import fs from "node:fs";
import path from "node:path";
import { ASSETS_DIR, TEMP_DIR } from "../config.js";
import { getBuffer, getRandomName } from "../utils/index.js";

export async function getProfileImageData(socket, userLid) {
  let profileImage = "";
  let buffer = null;
  let success = true;

  try {
    profileImage = await socket.profilePictureUrl(userLid, "image");

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
}
