/**
 * Serviços de upload de imagem e geração de link.
 *
 * @author Dev Gui
 */
import axios from "axios";
import FormData from "form-data";
import { LINKER_API_KEY, LINKER_BASE_URL, PREFIX } from "../config.js";
import { getSpiderApiToken } from "../utils/database.js";

/**
 * Não configure o token do Linker aqui, configure em: src/config.js
 */
function isApiKeyConfigured(apiKey) {
  return (
    typeof apiKey === "string" &&
    apiKey.trim() !== "" &&
    apiKey !== "seu_token_aqui"
  );
}

const messageIfKeyNotConfigured = `API Key do Linker ou token da Spider X API não configurado!
      
Para configurar, entre na pasta: \`src\` 
e edite o arquivo \`config.js\`:

Procure por:

\`export const LINKER_API_KEY = "seu_token_aqui";\`

Ou configure o token da Spider X API com:

\`export const SPIDER_API_TOKEN = "seu_token_aqui";\`

ou pelo comando:

\`${PREFIX}set-spider-api-token seu_token_aqui\`

Para obter uma API Key do Linker:
1. Acesse: https://linker.devgui.dev
2. Faça login ou crie uma conta entrando com sua conta Google
3. Vá em *Configurações*
4. Copie sua API Key

Para usar a Spider X API, crie uma conta em: https://api.spiderx.com.br`;

function getUploadApiKey() {
  if (isApiKeyConfigured(LINKER_API_KEY)) {
    return LINKER_API_KEY;
  }

  const spiderApiToken = getSpiderApiToken();

  if (isApiKeyConfigured(spiderApiToken)) {
    return spiderApiToken;
  }

  throw new Error(messageIfKeyNotConfigured);
}

export async function upload(imageBuffer, filename) {
  if (!Buffer.isBuffer(imageBuffer)) {
    throw new Error("O primeiro parâmetro deve ser um Buffer válido!");
  }

  if (typeof filename !== "string" || filename.trim() === "") {
    throw new Error("O segundo parâmetro deve ser o nome do arquivo!");
  }

  if (imageBuffer.length === 0) {
    throw new Error("O buffer da imagem está vazio!");
  }

  const apiKey = getUploadApiKey();

  const formData = new FormData();
  formData.append("file", imageBuffer, {
    filename: filename,
    contentType: "image/jpeg",
  });

  const response = await axios.post(`${LINKER_BASE_URL}/upload`, formData, {
    headers: {
      "X-API-Key": apiKey,
      ...formData.getHeaders(),
    },
  });

  const result = response.data;

  if (!result.url) {
    throw new Error(`Erro na API: ${result.error || "Erro desconhecido"}`);
  }

  return result.url;
}
