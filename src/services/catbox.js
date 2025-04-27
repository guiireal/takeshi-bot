/**
 * Módulo responsável por fazer o upload de imagens para o CatBox.
 * O CatBox é um serviço de hospedagem de arquivos.
 *
 * @author Dev Gui
 */
const { Catbox } = require("node-catbox");
const fs = require("node:fs");
const path = require("node:path");
const { TEMP_DIR } = require("../config");
const { getRandomName } = require("../utils");

exports.catBoxUpload = async (buffer) => {
  const catBox = new Catbox();

  const tempPath = path.resolve(TEMP_DIR, getRandomName("png"));

  fs.writeFileSync(tempPath, buffer);

  try {
    const response = await catBox.uploadFile({
      path: tempPath,
    });

    setTimeout(() => {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }, 1000 * 60 * 5);

    return response;
  } catch (error) {
    console.error("Erro ao fazer upload para o CatBox:", error);
    return null;
  }
};
