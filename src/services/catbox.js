const { errorLog } = require("../utils/logger");

exports.catBoxUpload = async (buffer) => {
  try {
    const formData = new FormData();
    formData.append("reqtype", "fileupload");
    formData.append("userhash", "");

    const blob = new Blob([buffer], { type: "image/png" });
    formData.append(
      "fileToUpload",
      blob,
      "e1c25e2f18430875d15fdcfbb14257e8.png"
    );

    const result = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      headers: {
        accept: "application/json",
        "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        "cache-control": "no-cache",
        "sec-ch-ua": '"Brave";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "sec-gpc": "1",
        "x-requested-with": "XMLHttpRequest",
        Referer: "https://catbox.moe/",
        "Referrer-Policy": "same-origin",
      },
      body: formData,
    });

    return await result.text();
  } catch (error) {
    errorLog("Erro ao fazer upload da imagem no CatBox: ", error);
    return null;
  }
};
