/**
 * Funções de comunicação
 * com a API do Spider X.
 *
 * @author Dev Gui
 */
import axios from "axios";

import * as config from "../config.js";
import { InvalidParameterError } from "../errors/index.js";
import { getSpiderApiToken } from "../utils/database.js";

const { SPIDER_API_BASE_URL } = config;

const spiderApi = axios.create();

const validationSubjects = {
  description: "A descrição",
  image_url: "A URL da imagem",
  search: "A pesquisa",
  text: "O texto",
  title: "O título",
};

function formatValidationMessage(field, message) {
  const subject = validationSubjects[field] || `O campo ${field}`;
  const minimum = message.match(/must be at least (\d+) characters/i)?.[1];
  const maximum = message.match(
    /must not be greater than (\d+) characters/i,
  )?.[1];

  if (minimum) {
    return `${subject} deve ter no mínimo ${minimum} caracteres.`;
  }

  if (maximum) {
    return `${subject} deve ter no máximo ${maximum} caracteres.`;
  }

  return message;
}

spiderApi.interceptors.response.use(undefined, (error) => {
  const validationMessages = Object.entries(
    error.response?.data?.errors || {},
  ).flatMap(([field, messages]) =>
    (Array.isArray(messages) ? messages : [messages])
      .filter((message) => typeof message === "string" && message.trim())
      .map((message) => formatValidationMessage(field, message)),
  );

  if (validationMessages.length) {
    throw new InvalidParameterError(validationMessages.join(" "));
  }

  return Promise.reject(error);
});

function validateLength(value, subject, minLength, maxLength) {
  const normalizedValue = String(value).trim();
  const length = Array.from(normalizedValue).length;

  if (length < minLength) {
    throw new InvalidParameterError(
      `${subject} deve ter no mínimo ${minLength} caracteres.`,
    );
  }

  if (maxLength && length > maxLength) {
    throw new InvalidParameterError(
      `${subject} deve ter no máximo ${maxLength} caracteres.`,
    );
  }

  return normalizedValue;
}

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

  const normalizedSearch = validateLength(search, "A pesquisa", 3, 100);
  const spiderApiToken = requireSpiderApiToken();

  const { data } = await spiderApi.get(
    `${SPIDER_API_BASE_URL}/downloads/play-${type}?search=${encodeURIComponent(
      normalizedSearch,
    )}&api_key=${spiderApiToken}`,
  );

  return data;
}

export async function download(type, url) {
  if (!url) {
    throw new Error("Você precisa informar uma URL do que deseja buscar!");
  }

  const spiderApiToken = requireSpiderApiToken();

  const { data } = await spiderApi.get(
    `${SPIDER_API_BASE_URL}/downloads/${type}?url=${encodeURIComponent(
      url,
    )}&api_key=${spiderApiToken}`,
  );

  return data;
}

export async function facebook(url) {
  return download("facebook", url);
}

export async function xTwitter(url) {
  return download("x-twitter", url);
}

export async function gemini(text) {
  if (!text) {
    throw new Error("Você precisa informar o parâmetro de texto!");
  }

  const normalizedText = validateLength(text, "O texto", 2);
  const spiderApiToken = requireSpiderApiToken();

  const { data } = await spiderApi.post(
    `${SPIDER_API_BASE_URL}/ai/gemini?api_key=${spiderApiToken}`,
    {
      text: normalizedText,
    },
  );

  return data.response;
}

export async function gpt5Mini(text) {
  if (!text) {
    throw new Error("Você precisa informar o parâmetro de texto!");
  }

  const normalizedText = validateLength(text, "O texto", 2);
  const spiderApiToken = requireSpiderApiToken();

  const { data } = await spiderApi.post(
    `${SPIDER_API_BASE_URL}/ai/gpt-5-mini?api_key=${spiderApiToken}`,
    {
      text: normalizedText,
    },
  );

  return data.response;
}

export async function deepseekV4Flash(text) {
  if (!text) {
    throw new Error("Você precisa informar o parâmetro de texto!");
  }

  const normalizedText = validateLength(text, "O texto", 2);
  const spiderApiToken = requireSpiderApiToken();

  const { data } = await spiderApi.post(
    `${SPIDER_API_BASE_URL}/ai/deepseek-v4-flash?api_key=${spiderApiToken}`,
    {
      text: normalizedText,
    },
  );

  return data.response;
}

export async function qwen37Flash(text) {
  if (!text) {
    throw new Error("Você precisa informar o parâmetro de texto!");
  }

  const normalizedText = validateLength(text, "O texto", 2);
  const spiderApiToken = requireSpiderApiToken();

  const { data } = await spiderApi.post(
    `${SPIDER_API_BASE_URL}/ai/qwen3-7-flash?api_key=${spiderApiToken}`,
    {
      text: normalizedText,
    },
  );

  return data.response;
}

export async function qwen38Flash(text) {
  if (!text) {
    throw new Error("Você precisa informar o parâmetro de texto!");
  }

  const normalizedText = validateLength(text, "O texto", 2);
  const spiderApiToken = requireSpiderApiToken();

  const { data } = await spiderApi.post(
    `${SPIDER_API_BASE_URL}/ai/qwen3-8-flash?api_key=${spiderApiToken}`,
    {
      text: normalizedText,
    },
  );

  return data.response;
}

export async function gpt56Luna(text) {
  if (!text) {
    throw new Error("Você precisa informar o parâmetro de texto!");
  }

  const normalizedText = validateLength(text, "O texto", 2);
  const spiderApiToken = requireSpiderApiToken();

  const { data } = await spiderApi.post(
    `${SPIDER_API_BASE_URL}/ai/gpt-5-6-luna?api_key=${spiderApiToken}`,
    {
      text: normalizedText,
    },
  );

  return data.response;
}

export async function transcribe(audioBuffer, mimeType, fileName) {
  if (!audioBuffer) {
    throw new Error("Você precisa informar o buffer do áudio!");
  }

  const spiderApiToken = requireSpiderApiToken();
  const formData = new FormData();
  const blob = new Blob([audioBuffer], { type: mimeType || "audio/ogg" });

  formData.append("audio", blob, fileName || "audio.ogg");

  const { data } = await spiderApi.post(
    `${SPIDER_API_BASE_URL}/ai/whisper-v3-turbo?api_key=${spiderApiToken}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  if (!data?.success || !data.transcription) {
    throw new Error(data?.message || "Não foi possível transcrever o áudio.");
  }

  return data.transcription;
}

const TTS_ALLOWED_VOICES = ["joao", "joão", "ana", "pedro"];
const TTS_MIN_TEXT_LENGTH = 5;
const TTS_MAX_TEXT_LENGTH = 2048;

export async function tts(text, voice = "joao") {
  if (!text) {
    throw new Error("Você precisa informar o texto para converter em áudio!");
  }

  const normalizedText = String(text).trim();

  validateLength(
    normalizedText,
    "O texto",
    TTS_MIN_TEXT_LENGTH,
    TTS_MAX_TEXT_LENGTH,
  );

  const normalizedVoice = String(voice || "joao").trim().toLowerCase();

  if (!TTS_ALLOWED_VOICES.includes(normalizedVoice)) {
    throw new Error("Voz inválida! Use: joao, ana ou pedro.");
  }

  const spiderApiToken = requireSpiderApiToken();

  const { data } = await spiderApi.post(
    `${SPIDER_API_BASE_URL}/ai/tts?api_key=${spiderApiToken}`,
    {
      text: normalizedText,
      voice: normalizedVoice,
    },
  );

  if (!data?.success || !data.url) {
    throw new Error(data?.message || "Não foi possível gerar o áudio.");
  }

  return data.url;
}

export async function attp(text) {
  if (!text) {
    throw new Error("Você precisa informar o parâmetro de texto!");
  }

  const normalizedText = validateLength(text, "O texto", 2, 255);
  const spiderApiToken = requireSpiderApiToken();

  return `${SPIDER_API_BASE_URL}/stickers/attp?text=${encodeURIComponent(
    normalizedText,
  )}&api_key=${spiderApiToken}`;
}

export async function ttp(text) {
  if (!text) {
    throw new Error("Você precisa informar o parâmetro de texto!");
  }

  const normalizedText = validateLength(text, "O texto", 2, 255);
  const spiderApiToken = requireSpiderApiToken();

  return `${SPIDER_API_BASE_URL}/stickers/ttp?text=${encodeURIComponent(
    normalizedText,
  )}&api_key=${spiderApiToken}`;
}

export async function brat(text) {
  if (!text) {
    throw new Error("Você precisa informar o parâmetro de texto!");
  }

  const normalizedText = validateLength(text, "O texto", 2, 255);
  const spiderApiToken = requireSpiderApiToken();

  return `${SPIDER_API_BASE_URL}/stickers/brat?text=${encodeURIComponent(
    normalizedText,
  )}&api_key=${spiderApiToken}`;
}

export async function abrat(text) {
  if (!text) {
    throw new Error("Você precisa informar o parâmetro de texto!");
  }

  const normalizedText = validateLength(text, "O texto", 2, 255);
  const spiderApiToken = requireSpiderApiToken();

  return `${SPIDER_API_BASE_URL}/stickers/abrat?text=${encodeURIComponent(
    normalizedText,
  )}&api_key=${spiderApiToken}`;
}

export async function pinterest(search) {
  if (!search) {
    throw new Error("Você precisa informar o parâmetro de pesquisa!");
  }

  const normalizedSearch = validateLength(search, "A pesquisa", 2, 100);
  const spiderApiToken = requireSpiderApiToken();

  const { data } = await spiderApi.get(
    `${SPIDER_API_BASE_URL}/downloads/pinterest?search=${encodeURIComponent(
      normalizedSearch,
    )}&api_key=${spiderApiToken}`,
  );

  return data;
}

export async function search(type, search) {
  if (!search) {
    throw new Error("Você precisa informar o parâmetro de pesquisa!");
  }

  const normalizedSearch = validateLength(search, "A pesquisa", 3, 100);
  const spiderApiToken = requireSpiderApiToken();

  const { data } = await spiderApi.get(
    `${SPIDER_API_BASE_URL}/search/${type}?search=${encodeURIComponent(
      normalizedSearch,
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

  const normalizedTitle = validateLength(title, "O título", 2, 30);
  const normalizedDescription = validateLength(
    description,
    "A descrição",
    2,
    100,
  );
  const spiderApiToken = requireSpiderApiToken();

  return `${SPIDER_API_BASE_URL}/canvas/welcome?title=${encodeURIComponent(
    normalizedTitle,
  )}&description=${encodeURIComponent(
    normalizedDescription,
  )}&image_url=${encodeURIComponent(imageURL)}&api_key=${spiderApiToken}`;
}

export function exit(title, description, imageURL) {
  if (!title || !description || !imageURL) {
    throw new Error(
      "Você precisa informar o título, descrição e URL da imagem!",
    );
  }

  const normalizedTitle = validateLength(title, "O título", 2, 30);
  const normalizedDescription = validateLength(
    description,
    "A descrição",
    2,
    100,
  );
  const spiderApiToken = requireSpiderApiToken();

  return `${SPIDER_API_BASE_URL}/canvas/goodbye?title=${encodeURIComponent(
    normalizedTitle,
  )}&description=${encodeURIComponent(
    normalizedDescription,
  )}&image_url=${encodeURIComponent(imageURL)}&api_key=${spiderApiToken}`;
}

export async function imageAI(description) {
  if (!description) {
    throw new Error("Você precisa informar a descrição da imagem!");
  }

  const normalizedDescription = validateLength(
    description,
    "A descrição",
    3,
    1024,
  );
  const spiderApiToken = requireSpiderApiToken();

  const { data } = await spiderApi.get(
    `${SPIDER_API_BASE_URL}/ai/flux?text=${encodeURIComponent(
      normalizedDescription,
    )}&api_key=${spiderApiToken}`,
  );

  return data;
}

export function canvas(type, imageURL) {
  if (!imageURL) {
    throw new Error("Você precisa informar a URL da imagem!");
  }

  const normalizedImageURL = validateLength(
    imageURL,
    "A URL da imagem",
    3,
    2048,
  );
  const spiderApiToken = requireSpiderApiToken();

  return `${SPIDER_API_BASE_URL}/canvas/${type}?image_url=${encodeURIComponent(
    normalizedImageURL,
  )}&api_key=${spiderApiToken}`;
}

export async function updatePlanUser(email, plan) {
  const spiderApiToken = requireSpiderApiToken();

  const { data } = await spiderApi.post(
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

  const { data } = await spiderApi.post(
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

export async function removeBg(
  buffer,
  mimeType = "image/png",
  fileName = "image.png",
) {
  if (!buffer) {
    throw new Error("Você precisa informar o buffer da imagem!");
  }

  const spiderApiToken = requireSpiderApiToken();

  const formData = new FormData();
  const blob = new Blob([buffer], { type: mimeType });
  formData.append("image", blob, fileName);

  const { data } = await spiderApi.post(
    `${SPIDER_API_BASE_URL}/removebg?api_key=${spiderApiToken}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      responseType: "arraybuffer",
    },
  );

  return Buffer.from(data);
}
