const { PREFIX } = require(`${BASE_DIR}/config`);
const { Hercai } = require("hercai");
const { WarningError } = require(`${BASE_DIR}/errors/WarningError`);

module.exports = {
  name: "image",
  description: "Gera uma imagem a partir da descrição fornecida",
  commands: ["image", "img", "imagem"],
  usage: `${PREFIX}imagem <descrição>`,
  handle: async ({
    fullArgs,
    sendWaitReact,
    sendSuccessReact,
    sendImageFromURL,
  }) => {
    if (!fullArgs.length) {
      throw new WarningError(
        "Por favor, forneça uma descrição para gerar a imagem."
      );
    }

    const herc = new Hercai();

    await sendWaitReact();

    const response = await herc.drawImage({
      model: "simurg",
      prompt: `Generate a realistic image, 
without deviating from the proposed theme below (attention, it may come in Portuguese, 
translate it into English first):
      
${fullArgs}`,
      negative_prompt: "nude, explicit, adult, nsfw",
    });

    await sendSuccessReact();

    await sendImageFromURL(response.url);
  },
};
