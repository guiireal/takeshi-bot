/**
 * Serviço para download de vídeos do TikTok usando @faouzkk/tiktok-dl
 * 
 * Limitações:
 * - A verificação de duração (30 minutos) não está disponível antes do download
 * - Apenas a verificação de tamanho (100MB) é aplicada após o download
 * - Funciona apenas com vídeos públicos do TikTok
 * 
 * @author Dev Gui
 */

const tiktokdl = require("@faouzkk/tiktok-dl");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const TEMP_DIR = path.join(__dirname, "../../assets/temp");
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB em bytes

/**
 * Valida se a URL é uma URL válida do TikTok
 * @param {string} url - URL a ser validada
 * @returns {boolean} True se a URL for válida
 */
function isValidTikTokUrl(url) {
  const tiktokPattern = /^https?:\/\/(www\.)?(tiktok\.com|vt\.tiktok\.com)/i;
  return tiktokPattern.test(url);
}

/**
 * Faz o download de um arquivo de uma URL e salva no caminho especificado
 * @param {string} url - URL do arquivo
 * @param {string} outputPath - Caminho onde o arquivo será salvo
 * @returns {Promise<void>}
 */
function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.tiktok.com/',
        'Origin': 'https://www.tiktok.com',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site'
      }
    };
    
    const file = fs.createWriteStream(outputPath);
    
    const request = protocol.get(url, options, (response) => {
      // Verificar se houve redirecionamento
      if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) {
        // Seguir o redirecionamento
        file.close();
        fs.unlinkSync(outputPath);
        downloadFile(response.headers.location, outputPath)
          .then(resolve)
          .catch(reject);
        return;
      }
      
      if (response.statusCode === 204) {
        file.close();
        fs.unlinkSync(outputPath);
        reject(new Error("A URL do vídeo não retornou conteúdo. O vídeo pode ter sido removido ou estar indisponível."));
        return;
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(outputPath);
        reject(new Error(`Falha ao baixar: Status ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on("finish", () => {
        file.close();
        resolve();
      });
    });
    
    request.on("error", (err) => {
      file.close();
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      reject(err);
    });
    
    file.on("error", (err) => {
      file.close();
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      reject(err);
    });
  });
}

/**
 * Baixa um vídeo do TikTok a partir de uma URL
 * @param {string} url - URL do vídeo do TikTok
 * @returns {Promise<{filePath: string, info: object}>} Caminho do arquivo baixado e informações do vídeo
 * @throws {Error} Se a URL for inválida, o vídeo não for encontrado, ou exceder 100MB
 */
async function downloadTiktokVideo(url) {
  // Validar URL
  if (!isValidTikTokUrl(url)) {
    throw new Error("URL inválida! A URL deve ser do TikTok (tiktok.com ou vt.tiktok.com).");
  }
  
  // Gerar nome único para o arquivo
  const timestamp = Date.now();
  const outputPath = path.join(TEMP_DIR, `tiktok_${timestamp}.mp4`);
  
  try {
    // Obter informações do vídeo usando a biblioteca
    console.log("[TIKTOK] Iniciando download...");
    const data = await tiktokdl(url);
    
    if (!data || data.status !== 200) {
      throw new Error(data?.message || "Nenhum vídeo encontrado! Verifique se a URL está correta e se o vídeo é público.");
    }
    
    if (!data.video) {
      throw new Error("Nenhum vídeo encontrado na resposta da API.");
    }
    
    // A biblioteca retorna a URL diretamente em qualidade máxima
    const videoUrl = data.video;
    
    if (!videoUrl) {
      throw new Error("Não foi possível extrair a URL do vídeo.");
    }
    
    // Baixar o vídeo
    await downloadFile(videoUrl, outputPath);
    
    // Verificar se o arquivo foi criado
    if (!fs.existsSync(outputPath)) {
      throw new Error("Falha ao salvar o vídeo.");
    }
    
    // Verificar tamanho do arquivo (limite de 100MB)
    const stats = fs.statSync(outputPath);
    const fileSizeInBytes = stats.size;
    
    if (fileSizeInBytes > MAX_FILE_SIZE) {
      // Excluir arquivo se exceder o limite
      fs.unlinkSync(outputPath);
      const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
      throw new Error(
        `Vídeo muito grande! Tamanho: ${fileSizeInMB}MB. O limite é de 100MB.`
      );
    }
    
    console.log("[TIKTOK] Download concluído com sucesso!");
    
    // Preparar informações do vídeo (a biblioteca não retorna metadados completos)
    const videoInfo = {
      title: "TikTok Video",
      author: "Desconhecido",
      duration: null,
      thumbnail: null,
      description: "",
    };
    
    return {
      filePath: outputPath,
      info: videoInfo,
    };
  } catch (error) {
    // Limpar arquivo se houver erro e ele existir
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
    
    // Re-lançar erro com mensagem mais amigável
    if (error.message.includes("URL inválida")) {
      throw error;
    } else if (error.message.includes("muito grande")) {
      throw error;
    } else if (error.message.includes("Nenhum vídeo encontrado")) {
      throw error;
    } else {
      throw new Error(
        `Erro ao baixar vídeo do TikTok: ${error.message}\n` +
        "Possíveis causas: vídeo privado, removido ou indisponível."
      );
    }
  }
}

/**
 * Remove um arquivo baixado temporariamente
 * @param {string} filePath - Caminho do arquivo para deletar
 */
function cleanupFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(`[TIKTOK] Erro ao limpar arquivo:`, error.message);
  }
}

module.exports = {
  downloadTiktokVideo,
  cleanupFile,
  isValidTikTokUrl,
};
