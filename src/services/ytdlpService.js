/**
 * Serviço para download de vídeos e áudios usando yt-dlp.
 * 
 * Este serviço substitui a dependência da Spider X API para downloads
 * do YouTube e outros sites suportados pelo yt-dlp.
 * 
 * Requisitos:
 * - yt-dlp instalado no sistema
 * - ffmpeg instalado no sistema (para conversões de áudio)
 * 
 * @author Dev Gui
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const unlink = promisify(fs.unlink);
const access = promisify(fs.access);

// Importar configurações
const {
  YTDLP_MAX_DURATION,
  YTDLP_MAX_FILESIZE,
  YTDLP_DEFAULT_VIDEO_QUALITY,
  YTDLP_AUDIO_FORMAT,
  YTDLP_AUDIO_QUALITY,
  TEMP_DIR,
} = require("../config");

// Configurações de limites (com fallback para valores padrão)
const MAX_DURATION_SECONDS = YTDLP_MAX_DURATION || 1800; // 30 minutos
const MAX_FILESIZE = YTDLP_MAX_FILESIZE || "100M";
const DEFAULT_VIDEO_QUALITY = YTDLP_DEFAULT_VIDEO_QUALITY || "720";
const AUDIO_FORMAT = YTDLP_AUDIO_FORMAT || "mp3";
const AUDIO_QUALITY = YTDLP_AUDIO_QUALITY || "0";

// Sistema de fila para downloads
const downloadQueue = [];
let isProcessingQueue = false;

// Garantir que o diretório temporário existe
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Adiciona um download à fila e processa
 * @param {Function} downloadFunction - Função de download a ser executada
 * @returns {Promise<any>}
 */
function addToQueue(downloadFunction) {
  return new Promise((resolve, reject) => {
    downloadQueue.push({ downloadFunction, resolve, reject });
    processQueue();
  });
}

/**
 * Processa a fila de downloads sequencialmente
 */
async function processQueue() {
  if (isProcessingQueue || downloadQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;

  while (downloadQueue.length > 0) {
    const { downloadFunction, resolve, reject } = downloadQueue.shift();
    
    try {
      const result = await downloadFunction();
      resolve(result);
    } catch (error) {
      reject(error);
    }
  }

  isProcessingQueue = false;
}

/**
 * Limpa arquivos temporários antigos (mais de 1 hora)
 */
function cleanupOldFiles() {
  try {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hora
    
    const files = fs.readdirSync(TEMP_DIR);
    
    files.forEach((file) => {
      if (file === ".gitignore" || file === "wa-logs.txt") return;
      
      const filePath = path.join(TEMP_DIR, file);
      const stats = fs.statSync(filePath);
      const age = now - stats.mtimeMs;
      
      if (age > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`[YTDLP] Arquivo antigo removido: ${file}`);
      }
    });
  } catch (error) {
    console.error("[YTDLP] Erro ao limpar arquivos antigos:", error.message);
  }
}

/**
 * Limpa manualmente a fila de downloads
 * Remove todos os downloads pendentes na fila
 */
function clearQueue() {
  const queueSize = downloadQueue.length;
  downloadQueue.length = 0; // Limpar array
  console.log(`[YTDLP] Fila limpa! ${queueSize} download(s) pendente(s) removido(s).`);
  return queueSize;
}

/**
 * Retorna informações sobre a fila atual
 * @returns {{queueSize: number, isProcessing: boolean}}
 */
function getQueueInfo() {
  return {
    queueSize: downloadQueue.length,
    isProcessing: isProcessingQueue,
  };
}

// Executar limpeza de arquivos antigos a cada 30 minutos
setInterval(cleanupOldFiles, 30 * 60 * 1000);
// Executar limpeza inicial
cleanupOldFiles();

/**
 * Verifica se o yt-dlp está instalado no sistema
 * @returns {Promise<boolean>}
 */
async function checkYtDlpInstalled() {
  return new Promise((resolve) => {
    const process = spawn("yt-dlp", ["--version"]);
    
    process.on("close", (code) => {
      resolve(code === 0);
    });
    
    process.on("error", () => {
      resolve(false);
    });
  });
}

/**
 * Executa um comando yt-dlp e retorna a saída
 * @param {string[]} args - Argumentos para o comando yt-dlp
 * @returns {Promise<string>}
 */
function executeYtDlp(args) {
  return new Promise((resolve, reject) => {
    const ytdlp = spawn("yt-dlp", args);
    
    let stdout = "";
    let stderr = "";
    
    ytdlp.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    
    ytdlp.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    
    ytdlp.on("close", (code) => {
      if (code !== 0) {
        // Tentar extrair mensagem de erro mais específica
        if (stderr.includes("File is larger than max-filesize")) {
          reject(new Error("Arquivo muito grande! O limite é de 100MB."));
        } else if (stderr.includes("Video unavailable") || stderr.includes("Private video")) {
          reject(new Error("Vídeo indisponível ou privado!"));
        } else if (stderr.includes("Unsupported URL")) {
          reject(new Error("URL não suportada!"));
        } else if (stderr.includes("Requested format is not available") || stderr.includes("requested format not available")) {
          reject(new Error("Este vídeo não está disponível na qualidade solicitada. Tente novamente."));
        } else if (stderr.includes("Sign in to confirm you") || stderr.includes("age")) {
          reject(new Error("Este vídeo possui restrição de idade e não pode ser baixado."));
        } else if (stderr.includes("This video is DRM protected")) {
          reject(new Error("Este vídeo possui proteção DRM e não pode ser baixado."));
        } else {
          reject(new Error(`Erro no yt-dlp: ${stderr || "Erro desconhecido"}`));
        }
      } else {
        resolve(stdout);
      }
    });
    
    ytdlp.on("error", (error) => {
      if (error.code === "ENOENT") {
        reject(new Error("yt-dlp não está instalado! Por favor, instale-o primeiro."));
      } else {
        reject(error);
      }
    });
  });
}

/**
 * Obtém informações sobre um vídeo sem fazer download
 * @param {string} url - URL do vídeo
 * @returns {Promise<Object>} Informações do vídeo
 */
async function getVideoInfo(url) {
  try {
    const output = await executeYtDlp([
      "--dump-json",
      "--no-warnings",
      "--no-call-home",
      "--no-check-certificate",
      url,
    ]);
    
    const info = JSON.parse(output);
    
    return {
      title: info.title || "Título não disponível",
      duration: info.duration || 0,
      thumbnail: info.thumbnail || "",
      description: info.description || "Sem descrição",
      channel: {
        name: info.uploader || info.channel || "Canal desconhecido",
        url: info.uploader_url || info.channel_url || "",
      },
      webpage_url: info.webpage_url || url,
      formats: info.formats || [],
      filesize: info.filesize || info.filesize_approx || 0,
    };
  } catch (error) {
    throw new Error(`Não foi possível obter informações do vídeo: ${error.message}`);
  }
}

/**
 * Faz o download de mídia (áudio ou vídeo) usando yt-dlp
 * @param {string} url - URL do vídeo/áudio
 * @param {'audio'|'video'} type - Tipo de mídia para baixar
 * @param {string} [qualityPreference='720'] - Preferência de qualidade para vídeo (ex: '360', '480', '720', '1080')
 * @returns {Promise<{filePath: string, info: Object}>} Caminho do arquivo baixado e informações
 */
async function downloadMedia(url, type, qualityPreference = "720") {
  // Adicionar à fila para processamento sequencial
  return addToQueue(async () => {
    // Verificar se yt-dlp está instalado
    const isInstalled = await checkYtDlpInstalled();
    if (!isInstalled) {
      throw new Error(
        "yt-dlp não está instalado!\n\n" +
        "Por favor, instale com:\n" +
        "- Windows: winget install yt-dlp ou baixe de https://github.com/yt-dlp/yt-dlp/releases\n" +
        "- Linux/Mac: sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && sudo chmod a+rx /usr/local/bin/yt-dlp"
      );
    }
  
  // Obter informações do vídeo primeiro para validar duração
  let videoInfo;
  try {
    videoInfo = await getVideoInfo(url);
  } catch (error) {
    throw new Error(`URL inválida ou vídeo indisponível: ${error.message}`);
  }
  
  // Validar duração (30 minutos = 1800 segundos)
  if (videoInfo.duration > MAX_DURATION_SECONDS) {
    const minutes = Math.floor(videoInfo.duration / 60);
    throw new Error(
      `Vídeo/áudio muito longo! Duração: ${minutes} minutos. O limite é de 30 minutos.`
    );
  }
  
  // Gerar nome único para o arquivo
  const timestamp = Date.now();
  const outputTemplate = path.join(TEMP_DIR, `${timestamp}.%(ext)s`);
  
  // Construir argumentos do yt-dlp
  const args = [
    "--no-warnings",
    "--no-call-home",
    "--no-check-certificate",
    `--max-filesize=${MAX_FILESIZE}`,
    "-o",
    outputTemplate,
  ];
  
  // Configurar formato baseado no tipo
  if (type === "audio") {
    args.push(
      "-f", "bestaudio/best",
      "-x", // Extrair áudio
      "--audio-format", AUDIO_FORMAT,
      "--audio-quality", AUDIO_QUALITY
    );
  } else if (type === "video") {
    // Formato de vídeo com múltiplos fallbacks para máxima compatibilidade
    const quality = qualityPreference || DEFAULT_VIDEO_QUALITY;
    args.push(
      "-f", 
      // Tenta várias combinações em ordem de preferência:
      // 1. Vídeo+áudio na qualidade desejada (MP4)
      // 2. Melhor vídeo+áudio na qualidade desejada (qualquer formato)
      // 3. Melhor formato único na qualidade desejada
      // 4. Melhor formato disponível (sem restrição de qualidade)
      `bestvideo[height<=?${quality}][ext=mp4]+bestaudio[ext=m4a]/` +
      `bestvideo[height<=?${quality}]+bestaudio/` +
      `best[height<=?${quality}]/` +
      `best`,
      // Mesclar vídeo e áudio se necessário
      "--merge-output-format", "mp4"
    );
  }
  
  args.push(url);
  
  // Executar download com retry em caso de erro de formato
  try {
    await executeYtDlp(args);
  } catch (error) {
    // Se for erro de formato e for vídeo, tentar com formato mais simples
    if (type === "video" && error.message.includes("format")) {
      console.log(`[YTDLP] Primeira tentativa falhou, tentando com formato alternativo...`);
      
      // Remover argumentos de formato antigos
      const retryArgs = [
        "--no-warnings",
        "--no-call-home",
        "--no-check-certificate",
        `--max-filesize=${MAX_FILESIZE}`,
        "-o",
        outputTemplate,
        "-f",
        "best", // Simplesmente pegar o melhor formato disponível
        url
      ];
      
      try {
        await executeYtDlp(retryArgs);
      } catch (retryError) {
        throw new Error(`Não foi possível baixar este vídeo. ${retryError.message}`);
      }
    } else {
      throw error;
    }
  }
  
  // Encontrar o arquivo baixado (yt-dlp adiciona a extensão automaticamente)
  const files = fs.readdirSync(TEMP_DIR);
  const downloadedFile = files.find((file) => file.startsWith(timestamp.toString()));
  
  if (!downloadedFile) {
    throw new Error("Arquivo não encontrado após o download!");
  }
  
    const filePath = path.join(TEMP_DIR, downloadedFile);
    
    return {
      filePath,
      info: videoInfo,
    };
  });
}

/**
 * Busca e baixa um vídeo/áudio por termo de pesquisa
 * @param {'audio'|'video'} type - Tipo de mídia
 * @param {string} searchQuery - Termo de busca
 * @param {string} [qualityPreference='720'] - Preferência de qualidade para vídeo
 * @returns {Promise<{filePath: string, info: Object}>}
 */
async function searchAndDownload(type, searchQuery, qualityPreference = "720") {
  // Adicionar à fila para processamento sequencial
  return addToQueue(async () => {
    // Verificar se yt-dlp está instalado
    const isInstalled = await checkYtDlpInstalled();
    if (!isInstalled) {
      throw new Error(
        "yt-dlp não está instalado!\n\n" +
        "Por favor, instale com:\n" +
        "- Windows: winget install yt-dlp ou baixe de https://github.com/yt-dlp/yt-dlp/releases\n" +
        "- Linux/Mac: sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && sudo chmod a+rx /usr/local/bin/yt-dlp"
      );
    }
    
    // Buscar vídeo no YouTube
    try {
      const searchUrl = `ytsearch1:${searchQuery}`;
      const infoOutput = await executeYtDlp([
        "--dump-json",
        "--no-warnings",
        searchUrl,
      ]);
      
      const info = JSON.parse(infoOutput);
      const videoUrl = info.webpage_url || info.url;
      
      if (!videoUrl) {
        throw new Error("Nenhum resultado encontrado!");
      }
      
      // Fazer download usando a URL encontrada (nota: downloadMedia já está na fila)
      // Precisamos chamar a lógica interna diretamente para evitar dupla fila
      const isInstalledAgain = await checkYtDlpInstalled();
      if (!isInstalledAgain) {
        throw new Error("yt-dlp não está instalado!");
      }
      
      // Obter informações do vídeo primeiro para validar duração
      let videoInfo;
      try {
        videoInfo = await getVideoInfo(videoUrl);
      } catch (error) {
        throw new Error(`URL inválida ou vídeo indisponível: ${error.message}`);
      }
      
      // Validar duração (30 minutos = 1800 segundos)
      if (videoInfo.duration > MAX_DURATION_SECONDS) {
        const minutes = Math.floor(videoInfo.duration / 60);
        throw new Error(
          `Vídeo/áudio muito longo! Duração: ${minutes} minutos. O limite é de 30 minutos.`
        );
      }
      
      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const outputTemplate = path.join(TEMP_DIR, `${timestamp}.%(ext)s`);
      
      // Construir argumentos do yt-dlp
      const args = [
        "--no-warnings",
        "--no-call-home",
        "--no-check-certificate",
        `--max-filesize=${MAX_FILESIZE}`,
        "-o",
        outputTemplate,
      ];
      
      // Configurar formato baseado no tipo
      if (type === "audio") {
        args.push(
          "-f", "bestaudio/best",
          "-x",
          "--audio-format", AUDIO_FORMAT,
          "--audio-quality", AUDIO_QUALITY
        );
      } else if (type === "video") {
        const quality = qualityPreference || DEFAULT_VIDEO_QUALITY;
        args.push(
          "-f", 
          `bestvideo[height<=?${quality}][ext=mp4]+bestaudio[ext=m4a]/` +
          `bestvideo[height<=?${quality}]+bestaudio/` +
          `best[height<=?${quality}]/` +
          `best`,
          "--merge-output-format", "mp4"
        );
      }
      
      args.push(videoUrl);
      
      // Executar download
      try {
        await executeYtDlp(args);
      } catch (error) {
        if (type === "video" && error.message.includes("format")) {
          const retryArgs = [
            "--no-warnings",
            "--no-call-home",
            "--no-check-certificate",
            `--max-filesize=${MAX_FILESIZE}`,
            "-o",
            outputTemplate,
            "-f",
            "best",
            videoUrl
          ];
          
          try {
            await executeYtDlp(retryArgs);
          } catch (retryError) {
            throw new Error(`Não foi possível baixar este vídeo. ${retryError.message}`);
          }
        } else {
          throw error;
        }
      }
      
      // Encontrar o arquivo baixado
      const files = fs.readdirSync(TEMP_DIR);
      const downloadedFile = files.find((file) => file.startsWith(timestamp.toString()));
      
      if (!downloadedFile) {
        throw new Error("Arquivo não encontrado após o download!");
      }
      
      const filePath = path.join(TEMP_DIR, downloadedFile);
      
      return {
        filePath,
        info: videoInfo,
      };
    } catch (error) {
      throw new Error(`Erro na busca: ${error.message}`);
    }
  });
}

/**
 * Remove um arquivo baixado temporariamente
 * @param {string} filePath - Caminho do arquivo para deletar
 */
async function cleanupFile(filePath) {
  try {
    await access(filePath);
    await unlink(filePath);
  } catch (error) {
    // Arquivo já não existe ou erro ao deletar, ignorar
    console.error(`Erro ao limpar arquivo ${filePath}:`, error.message);
  }
}

module.exports = {
  getVideoInfo,
  downloadMedia,
  searchAndDownload,
  cleanupFile,
  checkYtDlpInstalled,
  clearQueue,
  getQueueInfo,
};
