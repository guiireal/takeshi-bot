/**
 * Funções de comunicação
 * com a API do Spider X.
 *
 * @author Dev Gui
 */
import axios from "axios";

import * as config from "../config.js";
import { getSpiderApiToken } from "../utils/database.js";

const { SPIDER_API_BASE_URL } = config;

/**
 * Não configure o token da Spider X API aqui, configure em: src/config.js
 */
function isSpiderApiTokenConfigured(token) {
  return token && token.trim() !== "" && token !== "seu_token_aqui";
}

const messageIfTokenNotConfigured = `Token da API do Spider X não configurado!
      
Para configurar, entre na pasta: \`src\` 
e edite o arquivo \`config.js\`:

Procure por:

\`export const SPIDER_API_TOKEN = "seu_token_aqui";\`

ou

Use o comando:

${config.PREFIX}set-spider-api-token seu_token_aqui

Não esqueça de ver se ${config.PREFIX} é seu prefixo!

Para obter o seu token, 
crie uma conta em: https://api.spiderx.com.br
e contrate um plano!`;

export let spiderAPITokenConfigured =
  isSpiderApiTokenConfigured(getSpiderApiToken());

function requireSpiderApiToken() {
  const token = getSpiderApiToken();
  spiderAPITokenConfigured = isSpiderApiTokenConfigured(token);

  if (!spiderAPITokenConfigured) {
    throw new Error(messageIfTokenNotConfigured);
  }

  return token;
}

export async function play(type, search) {
  if (!search) {
    throw new Error("Você precisa informar o que deseja buscar!");
  }

  const spiderApiToken = requireSpiderApiToken();

  const { data } = await axios.get(
    `${SPIDER_API_BASE_URL}/downloads/play-${type}?search=${encodeURIComponent(
      search,
    )}&api_key=${spiderApiToken}`,
  );

  return data;
}

export async function download(type, url) {
  if (!url) {
    throw new Error("Você precisa informar uma URL do que deseja buscar!");
  }

  const spiderApiToken = requireSpiderApiToken();

  const { data } = await axios.get(
    `${SPIDER_API_BASE_URL}/downloads/${type}?url=${encodeURIComponent(
      url,
    )}&api_key=${spiderApiToken}`,
  );

  return data;
}

export async function facebook(url) {
  return download("facebook", url);
}

export async function gemini(text) {
  if (!text) {
    throw new Error("Você precisa informar o parâmetro de texto!");
  }

  const spiderApiToken = requireSpiderApiToken();

  const { data } = await axios.post(
    `${SPIDER_API_BASE_URL}/ai/gemini?api_key=${spiderApiToken}`,
    {
      text,
    },
  );

  return data.response;
}

export async function gpt5Mini(text) {
  if (!text) {
    throw new Error("Você precisa informar o parâmetro de texto!");
  }

  const spiderApiToken = requireSpiderApiToken();

  const { data } = await axios.post(
    `${SPIDER_API_BASE_URL}/ai/gpt-5-mini?api_key=${spiderApiToken}`,
    {
      text,
    },
  );

  return data.response;
}

export async function deepseekV4Flash(text) {
  if (!text) {
    throw new Error("Você precisa informar o parâmetro de texto!");
  }

  const spiderApiToken = requireSpiderApiToken();

  const { data } = await axios.post(
    `${SPIDER_API_BASE_URL}/ai/deepseek-v4-flash?api_key=${spiderApiToken}`,
    {
      text,
    },
  );

  return data.response;
}

export async function attp(text) {
  if (!text) {
    throw new Error("Você precisa informar o parâmetro de texto!");
  }

  const spiderApiToken = requireSpiderApiToken();

  return `${SPIDER_API_BASE_URL}/stickers/attp?text=${encodeURIComponent(
    text,
  )}&api_key=${spiderApiToken}`;
}

export async function ttp(text) {
  if (!text) {
    throw new Error("Você precisa informar o parâmetro de texto!");
  }

  const spiderApiToken = requireSpiderApiToken();

  return `${SPIDER_API_BASE_URL}/stickers/ttp?text=${encodeURIComponent(
    text,
  )}&api_key=${spiderApiToken}`;
}

export async function brat(text) {
  if (!text) {
    throw new Error("Você precisa informar o parâmetro de texto!");
  }

  const spiderApiToken = requireSpiderApiToken();

  return `${SPIDER_API_BASE_URL}/stickers/brat?text=${encodeURIComponent(
    text,
  )}&api_key=${spiderApiToken}`;
}

export async function pinterest(search) {
  if (!search) {
    throw new Error("Você precisa informar o parâmetro de pesquisa!");
  }

  const spiderApiToken = requireSpiderApiToken();

  const { data } = await axios.get(
    `${SPIDER_API_BASE_URL}/downloads/pinterest?search=${encodeURIComponent(
      search,
    )}&api_key=${spiderApiToken}`,
  );

  return data;
}

export async function search(type, search) {
  if (!search) {
    throw new Error("Você precisa informar o parâmetro de pesquisa!");
  }

  const spiderApiToken = requireSpiderApiToken();

  const { data } = await axios.get(
    `${SPIDER_API_BASE_URL}/search/${type}?search=${encodeURIComponent(
      search,
    )}&api_key=${spiderApiToken}`,
  );

  return data;
}

export function welcome(title, description, imageURL) {
  if (!title || !description || !imageURL) {
    throw new Error(
      "Você precisa informar o título, descrição e URL da imagem!",
    );
  }

  const spiderApiToken = requireSpiderApiToken();

  return `${SPIDER_API_BASE_URL}/canvas/welcome?title=${encodeURIComponent(
    title,
  )}&description=${encodeURIComponent(
    description,
  )}&image_url=${encodeURIComponent(imageURL)}&api_key=${spiderApiToken}`;
}

export function exit(title, description, imageURL) {
  if (!title || !description || !imageURL) {
    throw new Error(
      "Você precisa informar o título, descrição e URL da imagem!",
    );
  }

  const spiderApiToken = requireSpiderApiToken();

  return `${SPIDER_API_BASE_URL}/canvas/goodbye?title=${encodeURIComponent(
    title,
  )}&description=${encodeURIComponent(
    description,
  )}&image_url=${encodeURIComponent(imageURL)}&api_key=${spiderApiToken}`;
}

export async function imageAI(description) {
  if (!description) {
    throw new Error("Você precisa informar a descrição da imagem!");
  }

  const spiderApiToken = requireSpiderApiToken();

  const { data } = await axios.get(
    `${SPIDER_API_BASE_URL}/ai/flux?text=${encodeURIComponent(
      description,
    )}&api_key=${spiderApiToken}`,
  );

  return data;
}

export function canvas(type, imageURL) {
  if (!imageURL) {
    throw new Error("Você precisa informar a URL da imagem!");
  }

  const spiderApiToken = requireSpiderApiToken();

  return `${SPIDER_API_BASE_URL}/canvas/${type}?image_url=${encodeURIComponent(
    imageURL,
  )}&api_key=${spiderApiToken}`;
}

export async function setProxy(name) {
  try {
    if (!name) {
      throw new Error("Você precisa informar o nome da nova proxy!");
    }

    const spiderApiToken = requireSpiderApiToken();

    const { data } = await axios.post(
      `${SPIDER_API_BASE_URL}/internal/set-node-js-proxy-active?api_key=${spiderApiToken}`,
      {
        name,
      },
    );

    return data.success;
  } catch (error) {
    console.error("Erro ao definir a proxy:", error);
    throw new Error(
      "Não foi possível definir a proxy! Verifique se o nome está correto e tente novamente!",
    );
  }
}

export async function updatePlanUser(email, plan) {
  const spiderApiToken = requireSpiderApiToken();

  const { data } = await axios.post(
    `${SPIDER_API_BASE_URL}/internal/update-plan-user?api_key=${spiderApiToken}`,
    {
      email,
      plan,
    },
  );

  return data;
}

export async function toGif(buffer) {
  if (!buffer) {
    throw new Error("Você precisa informar o buffer do arquivo!");
  }

  const spiderApiToken = requireSpiderApiToken();

  const formData = new FormData();
  const blob = new Blob([buffer], { type: "image/webp" });
  formData.append("file", blob, "sticker.webp");

  const { data } = await axios.post(
    `${SPIDER_API_BASE_URL}/utilities/to-gif?api_key=${spiderApiToken}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data.url;
}
