/**
 * Funções de comunicação
 * com a API do Spider X.
 *
 * @author Dev Gui
 */
const axios = require("axios");

let { SPIDER_API_TOKEN, SPIDER_API_BASE_URL } = require("../config");
const { getSpiderApiToken } = require("../utils/database");

const spiderApiTokenConfig = getSpiderApiToken();

if (spiderApiTokenConfig) {
  SPIDER_API_TOKEN = spiderApiTokenConfig;
}

/**
 * Não configure o token da Spider X API aqui, configure em: src/config.js
 */
const spiderAPITokenConfigured =
  SPIDER_API_TOKEN && SPIDER_API_TOKEN !== "seu_token_aqui";

const messageIfTokenNotConfigured = `Token da API do Spider X não configurado!
      
Para configurar, entre na pasta: \`src\` 
e edite o arquivo \`config.js\`:

Procure por:

\`exports.SPIDER_API_TOKEN = "seu_token_aqui";\`

ou

Use o comando:

/set-spider-api-token seu_token_aqui

Não esqueça de ver se a / é seu prefixo!

Para obter o seu token, 
crie uma conta em: https://api.spiderx.com.br
e contrate um plano!`;

exports.spiderAPITokenConfigured = spiderAPITokenConfigured;

exports.play = async (type, search) => {
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
};

exports.download = async (type, url) => {
  if (!url) {
    throw new Error(
      "Você precisa informar uma URL do YouTube do que deseja buscar!"
    );
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
};

exports.gemini = async (text) => {
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
};

exports.attp = async (text) => {
  if (!text) {
    throw new Error("Você precisa informar o parâmetro de texto!");
  }

  if (!spiderAPITokenConfigured) {
    throw new Error(messageIfTokenNotConfigured);
  }

  return `${SPIDER_API_BASE_URL}/stickers/attp?text=${encodeURIComponent(
    text
  )}&api_key=${SPIDER_API_TOKEN}`;
};

exports.ttp = async (text) => {
  if (!text) {
    throw new Error("Você precisa informar o parâmetro de texto!");
  }

  if (!spiderAPITokenConfigured) {
    throw new Error(messageIfTokenNotConfigured);
  }

  return `${SPIDER_API_BASE_URL}/stickers/ttp?text=${encodeURIComponent(
    text
  )}&api_key=${SPIDER_API_TOKEN}`;
};

exports.search = async (type, search) => {
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
};

exports.welcome = (title, description, imageURL) => {
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
};

exports.exit = (title, description, imageURL) => {
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
};

exports.imageAI = async (description) => {
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
};

exports.canvas = (type, imageURL) => {
  if (!imageURL) {
    throw new Error("Você precisa informar a URL da imagem!");
  }

  if (!spiderAPITokenConfigured) {
    throw new Error(messageIfTokenNotConfigured);
  }

  return `${SPIDER_API_BASE_URL}/canvas/${type}?image_url=${encodeURIComponent(
    imageURL
  )}&api_key=${SPIDER_API_TOKEN}`;
};

exports.setProxy = async (name) => {
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
};
