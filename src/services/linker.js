/**
 * Serviços de upload de imagem e geração de link.
 *
 * @author Dev Gui
 */
import axios from "axios";
import FormData from "form-data";
import { LINKER_API_KEY, LINKER_BASE_URL } from "../config.js";

/**
 * Não configure o token do Linker aqui, configure em: src/config.js
 */
let linkerAPIKeyConfigured =
  LINKER_API_KEY &&
  LINKER_API_KEY.trim() !== "" &&
  LINKER_API_KEY !== "seu_token_aqui";

const messageIfKeyNotConfigured = `API Key do Linker não configurada!
      
Para configurar, entre na pasta: \`src\` 
e edite o arquivo \`config.js\`:

Procure por:

\`export const LINKER_API_KEY = "seu_token_aqui";\`

Para obter sua API Key:
1. Acesse: https://linker.devgui.dev
2. Faça login ou crie uma conta entrando com sua conta Google
3. Vá em *Configurações*
4. Copie sua API Key`;

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

  if (!linkerAPIKeyConfigured) {
    throw new Error(messageIfKeyNotConfigured);
  }

  const formData = new FormData();
  formData.append("file", imageBuffer, {
    filename: filename,
    contentType: "image/jpeg",
  });

  const response = await axios.post(`${LINKER_BASE_URL}/upload`, formData, {
    headers: {
      "X-API-Key": LINKER_API_KEY,
      ...formData.getHeaders(),
    },
  });

  const result = response.data;

  if (!result.url) {
    throw new Error(`Erro na API: ${result.error || "Erro desconhecido"}`);
  }

  return result.url;
}
