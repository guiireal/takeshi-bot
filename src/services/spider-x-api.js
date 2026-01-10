/**
 * Funções de comunicação
 * com a API do Spider X.
 *
 * @author Dev Gui
 */
import axios from "axios";

import * as config from "../config.js";
import { getSpiderApiToken } from "../utils/database.js";

let { SPIDER_API_TOKEN, SPIDER_API_BASE_URL } = config;

const spiderApiTokenConfig = getSpiderApiToken();

if (spiderApiTokenConfig) {
  SPIDER_API_TOKEN = spiderApiTokenConfig;
}

/**
 * Não configure o token da Spider X API aqui, configure em: src/config.js
 */
let spiderAPITokenConfigured =
  SPIDER_API_TOKEN &&
  SPIDER_API_TOKEN.trim() !== "" &&
  SPIDER_API_TOKEN !== "seu_token_aqui";

const messageIfTokenNotConfigured = `Token da API do Spider X não configurado!
      
Para configurar, entre na pasta: \`src\` 
e edite o arquivo \`config.js\`:

Procure por:

\`export const SPIDER_API_TOKEN = "seu_token_aqui";\`

ou

Use o comando:

/set-spider-api-token seu_token_aqui

Não esqueça de ver se a / é seu prefixo!

Para obter o seu token, 
crie uma conta em: https://api.spiderx.com.br
e contrate um plano!`;

export { spiderAPITokenConfigured };

export async function play(type, search) {
  if (!search) {
    throw new Error("Você precisa informar o que deseja buscar!");
  }

  if (!spiderAPITokenConfigured) {
    throw new Error(messageIfTokenNotConfigured);
  }

  const { data } = await axios.get(
    `${SPIDER_API_BASE_URL}/downloads/play-${type}?search=${encodeURIComponent(
      search
    )}&api_key=${SPIDER_API_TOKEN}`
  );

  return data;
}

export async function download(type, url) {
  if (!url) {
    throw new Error("Você precisa informar uma URL do que deseja buscar!");
  }

  if (!spiderAPITokenConfigured) {
    throw new Error(messageIfTokenNotConfigured);
  }

  const { data } = await axios.get(
    `${SPIDER_API_BASE_URL}/downloads/${type}?url=${encodeURIComponent(
      url
    )}&api_key=${SPIDER_API_TOKEN}`
  );

  return data;
}

export async function gemini(text) {
  if (!text) {
    throw new Error("Você precisa informar o parâmetro de texto!");
  }

  if (!spiderAPITokenConfigured) {
    throw new Error(messageIfTokenNotConfigured);
  }

  const { data } = await axios.post(
    `${SPIDER_API_BASE_URL}/ai/gemini?api_key=${SPIDER_API_TOKEN}`,
    {
      text,
    }
  );

  return data.response;
}

export async function gpt5Mini(text) {
  if (!text) {
    throw new Error("Você precisa informar o parâmetro de texto!");
  }

  if (!spiderAPITokenConfigured) {
    throw new Error(messageIfTokenNotConfigured);
  }

  const { data } = await axios.post(
    `${SPIDER_API_BASE_URL}/ai/gpt-5-mini?api_key=${SPIDER_API_TOKEN}`,
    {
      text,
    }
  );

  return data.response;
}

export async function attp(text) {
  if (!text) {
    throw new Error("Você precisa informar o parâmetro de texto!");
  }

  if (!spiderAPITokenConfigured) {
    throw new Error(messageIfTokenNotConfigured);
  }

  return `${SPIDER_API_BASE_URL}/stickers/attp?text=${encodeURIComponent(
    text
  )}&api_key=${SPIDER_API_TOKEN}`;
}

export async function ttp(text) {
  if (!text) {
    throw new Error("Você precisa informar o parâmetro de texto!");
  }

  if (!spiderAPITokenConfigured) {
    throw new Error(messageIfTokenNotConfigured);
  }

  return `${SPIDER_API_BASE_URL}/stickers/ttp?text=${encodeURIComponent(
    text
  )}&api_key=${SPIDER_API_TOKEN}`;
}

export async function search(type, search) {
  if (!search) {
    throw new Error("Você precisa informar o parâmetro de pesquisa!");
  }

  if (!spiderAPITokenConfigured) {
    throw new Error(messageIfTokenNotConfigured);
  }

  const { data } = await axios.get(
    `${SPIDER_API_BASE_URL}/search/${type}?search=${encodeURIComponent(
      search
    )}&api_key=${SPIDER_API_TOKEN}`
  );

  return data;
}

export function welcome(title, description, imageURL) {
  if (!title || !description || !imageURL) {
    throw new Error(
      "Você precisa informar o título, descrição e URL da imagem!"
    );
  }

  if (!spiderAPITokenConfigured) {
    throw new Error(messageIfTokenNotConfigured);
  }

  return `${SPIDER_API_BASE_URL}/canvas/welcome?title=${encodeURIComponent(
    title
  )}&description=${encodeURIComponent(
    description
  )}&image_url=${encodeURIComponent(imageURL)}&api_key=${SPIDER_API_TOKEN}`;
}

export function exit(title, description, imageURL) {
  if (!title || !description || !imageURL) {
    throw new Error(
      "Você precisa informar o título, descrição e URL da imagem!"
    );
  }

  if (!spiderAPITokenConfigured) {
    throw new Error(messageIfTokenNotConfigured);
  }

  return `${SPIDER_API_BASE_URL}/canvas/goodbye?title=${encodeURIComponent(
    title
  )}&description=${encodeURIComponent(
    description
  )}&image_url=${encodeURIComponent(imageURL)}&api_key=${SPIDER_API_TOKEN}`;
}

export async function imageAI(description) {
  if (!description) {
    throw new Error("Você precisa informar a descrição da imagem!");
  }

  if (!spiderAPITokenConfigured) {
    throw new Error(messageIfTokenNotConfigured);
  }

  const { data } = await axios.get(
    `${SPIDER_API_BASE_URL}/ai/flux?text=${encodeURIComponent(
      description
    )}&api_key=${SPIDER_API_TOKEN}`
  );

  return data;
}

export function canvas(type, imageURL) {
  if (!imageURL) {
    throw new Error("Você precisa informar a URL da imagem!");
  }

  if (!spiderAPITokenConfigured) {
    throw new Error(messageIfTokenNotConfigured);
  }

  return `${SPIDER_API_BASE_URL}/canvas/${type}?image_url=${encodeURIComponent(
    imageURL
  )}&api_key=${SPIDER_API_TOKEN}`;
}

export async function setProxy(name) {
  try {
    if (!name) {
      throw new Error("Você precisa informar o nome da nova proxy!");
    }

    if (!spiderAPITokenConfigured) {
      throw new Error(messageIfTokenNotConfigured);
    }

    const { data } = await axios.post(
      `${SPIDER_API_BASE_URL}/internal/set-node-js-proxy-active?api_key=${SPIDER_API_TOKEN}`,
      {
        name,
      }
    );

    return data.success;
  } catch (error) {
    console.error("Erro ao definir a proxy:", error);
    throw new Error(
      "Não foi possível definir a proxy! Verifique se o nome está correto e tente novamente!"
    );
  }
}

export async function updatePlanUser(email, plan) {
  const { data } = await axios.post(
    `${SPIDER_API_BASE_URL}/internal/update-plan-user?api_key=${SPIDER_API_TOKEN}`,
    {
      email,
      plan,
    }
  );

  return data;
}

export async function toGif(buffer) {
  if (!buffer) {
    throw new Error("Você precisa informar o buffer do arquivo!");
  }

  if (!spiderAPITokenConfigured) {
    throw new Error(messageIfTokenNotConfigured);
  }

  const formData = new FormData();
  const blob = new Blob([buffer], { type: "image/webp" });
  formData.append("file", blob, "sticker.webp");

  const { data } = await axios.post(
    `${SPIDER_API_BASE_URL}/utilities/to-gif?api_key=${SPIDER_API_TOKEN}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data.url;
}
