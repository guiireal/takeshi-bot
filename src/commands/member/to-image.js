const { PREFIX, TEMP_DIR } = require("../../config");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { InvalidParameterError } = require("../../errors/InvalidParameterError");

module.exports = {
  name: "toimage",
  description: "Transformo figurinhas estáticas em imagem",
  commands: ["toimage", "toimg"],
  usage: `${PREFIX}toimage (marque a figurinha) ou ${PREFIX}toimage (responda a figurinha)`,
  handle: async ({
    isSticker,
    downloadSticker,
    webMessage,
    sendImageFromFile,
  }) => {
    if (!isSticker) {
      throw new InvalidParameterError("Você precisa enviar uma figurinha!");
    }

    const inputPath = await downloadSticker(webMessage, "input");
    const outputPath = path.resolve(TEMP_DIR, "output.png");

    exec(`ffmpeg -i ${inputPath} ${outputPath}`, async (error) => {
      if (error) {
        console.log(error);
        throw new Error(error);
      }

      await sendImageFromFile(outputPath);

      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  },
};
