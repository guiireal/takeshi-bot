# 💡 Dicas e Boas Práticas - Downloads com yt-dlp

## 🎯 Configurações Recomendadas

### Para Uso Geral (Balanceado)
```javascript
// src/config.js
exports.YTDLP_MAX_DURATION = 1800;          // 30 minutos
exports.YTDLP_MAX_FILESIZE = "100M";        // 100 MB
exports.YTDLP_DEFAULT_VIDEO_QUALITY = "720"; // 720p
exports.YTDLP_AUDIO_FORMAT = "mp3";         // MP3
exports.YTDLP_AUDIO_QUALITY = "0";          // Melhor qualidade
```

### Para Economia de Dados/Espaço
```javascript
// src/config.js
exports.YTDLP_MAX_DURATION = 900;           // 15 minutos
exports.YTDLP_MAX_FILESIZE = "50M";         // 50 MB
exports.YTDLP_DEFAULT_VIDEO_QUALITY = "480"; // 480p
exports.YTDLP_AUDIO_FORMAT = "mp3";         // MP3
exports.YTDLP_AUDIO_QUALITY = "5";          // Qualidade média
```

### Para Melhor Qualidade
```javascript
// src/config.js
exports.YTDLP_MAX_DURATION = 3600;          // 60 minutos
exports.YTDLP_MAX_FILESIZE = "200M";        // 200 MB
exports.YTDLP_DEFAULT_VIDEO_QUALITY = "1080"; // 1080p
exports.YTDLP_AUDIO_FORMAT = "mp3";         // MP3
exports.YTDLP_AUDIO_QUALITY = "0";          // Melhor qualidade
```

## ⚠️ Considerações Importantes

### 1. Limites do WhatsApp
O WhatsApp tem seus próprios limites para envio de arquivos:
- **Máximo de ~16MB** para vídeos em alguns casos
- **Até ~100MB** em condições ideais
- Arquivos grandes podem falhar ou demorar muito

**Recomendação:** Mantenha `YTDLP_MAX_FILESIZE` em "100M" ou menos.

### 2. Performance
- Downloads grandes consomem mais CPU, memória e banda
- Múltiplos downloads simultâneos podem sobrecarregar o servidor
- Considere implementar uma fila de downloads para muitos usuários

### 3. Espaço em Disco
- Arquivos temporários são criados em `assets/temp/`
- São deletados automaticamente após o envio
- Em caso de erro, podem ficar "órfãos"
- **Recomendação:** Adicione um job de limpeza periódica

## 🔧 Manutenção

### Limpeza Manual de Arquivos Temporários

**Linux/Mac:**
```bash
# Listar arquivos temporários
ls -lh assets/temp/

# Remover todos os arquivos (exceto .gitignore)
find assets/temp/ -type f ! -name '.gitignore' -delete
```

**Windows (PowerShell):**
```powershell
# Listar arquivos temporários
Get-ChildItem "assets\temp\" -Recurse

# Remover todos os arquivos (exceto .gitignore)
Get-ChildItem "assets\temp\" -Recurse -Exclude ".gitignore" | Remove-Item
```

### Script de Limpeza Automática

Crie `scripts/cleanup-temp.js`:
```javascript
const fs = require("fs");
const path = require("path");

const TEMP_DIR = path.join(__dirname, "..", "assets", "temp");
const MAX_AGE_HOURS = 2; // Remover arquivos com mais de 2 horas

function cleanupTempFiles() {
  const now = Date.now();
  const maxAge = MAX_AGE_HOURS * 60 * 60 * 1000;

  const files = fs.readdirSync(TEMP_DIR);
  let removed = 0;

  files.forEach((file) => {
    if (file === ".gitignore") return;

    const filePath = path.join(TEMP_DIR, file);
    const stats = fs.statSync(filePath);
    const age = now - stats.mtimeMs;

    if (age > maxAge) {
      fs.unlinkSync(filePath);
      removed++;
      console.log(`Removido: ${file}`);
    }
  });

  console.log(`\n✅ Limpeza concluída! ${removed} arquivo(s) removido(s).`);
}

cleanupTempFiles();
```

Execute periodicamente:
```bash
node scripts/cleanup-temp.js
```

Ou com cron (Linux/Mac):
```bash
# Executar a cada 2 horas
0 */2 * * * cd /caminho/do/bot && node scripts/cleanup-temp.js
```

## 📊 Monitoramento

### Verificar Uso de Espaço

**Linux/Mac:**
```bash
du -sh assets/temp/
```

**Windows:**
```powershell
(Get-ChildItem "assets\temp\" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
```

### Logs Úteis

Adicione logs no ytdlpService para monitorar:
```javascript
console.log(`[DOWNLOAD] Iniciando: ${url} (${type})`);
console.log(`[DOWNLOAD] Concluído: ${filePath} (${(fileSizeInBytes / 1024 / 1024).toFixed(2)}MB)`);
console.log(`[CLEANUP] Removido: ${filePath}`);
```

## 🚀 Otimizações

### 1. Cache de Informações de Vídeos

Implemente um cache simples para evitar consultas repetidas:
```javascript
const videoInfoCache = new Map();

async function getCachedVideoInfo(url) {
  if (videoInfoCache.has(url)) {
    return videoInfoCache.get(url);
  }
  
  const info = await getVideoInfo(url);
  videoInfoCache.set(url, info);
  
  // Limpar cache após 1 hora
  setTimeout(() => videoInfoCache.delete(url), 3600000);
  
  return info;
}
```

### 2. Fila de Downloads

Para múltiplos usuários, implemente uma fila:
```javascript
const downloadQueue = [];
let isDownloading = false;

async function addToQueue(url, type, callback) {
  downloadQueue.push({ url, type, callback });
  processQueue();
}

async function processQueue() {
  if (isDownloading || downloadQueue.length === 0) return;
  
  isDownloading = true;
  const { url, type, callback } = downloadQueue.shift();
  
  try {
    const result = await downloadMedia(url, type);
    callback(null, result);
  } catch (error) {
    callback(error);
  }
  
  isDownloading = false;
  processQueue();
}
```

### 3. Compressão de Vídeos

Para vídeos muito grandes, adicione compressão com ffmpeg:
```javascript
const ffmpeg = require("fluent-ffmpeg");

function compressVideo(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        "-c:v libx264",
        "-crf 28",
        "-preset fast",
        "-c:a aac",
        "-b:a 128k",
      ])
      .output(outputPath)
      .on("end", resolve)
      .on("error", reject)
      .run();
  });
}
```

## 🔒 Segurança

### 1. Rate Limiting

Implemente limite de requisições por usuário:
```javascript
const userDownloads = new Map();
const MAX_DOWNLOADS_PER_HOUR = 10;

function checkRateLimit(userId) {
  const now = Date.now();
  const userHistory = userDownloads.get(userId) || [];
  
  // Remover downloads com mais de 1 hora
  const recentDownloads = userHistory.filter(
    (time) => now - time < 3600000
  );
  
  if (recentDownloads.length >= MAX_DOWNLOADS_PER_HOUR) {
    throw new Error("Limite de downloads por hora excedido!");
  }
  
  recentDownloads.push(now);
  userDownloads.set(userId, recentDownloads);
}
```

### 2. Whitelist de Domínios

Restrinja downloads apenas de sites confiáveis:
```javascript
const ALLOWED_DOMAINS = [
  "youtube.com",
  "youtu.be",
  "soundcloud.com",
  // Adicione outros conforme necessário
];

function isAllowedDomain(url) {
  const domain = new URL(url).hostname.replace("www.", "");
  return ALLOWED_DOMAINS.some((allowed) => domain.includes(allowed));
}
```

### 3. Validação de URLs

Sempre valide URLs antes de processar:
```javascript
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}
```

## 📱 Experiência do Usuário

### 1. Mensagens de Status

Mantenha o usuário informado:
```javascript
await sendWaitReact(); // ⏳
await sendText("🔍 Buscando vídeo...");
await sendText("⬇️ Fazendo download... Isso pode levar alguns minutos.");
await sendText("📤 Enviando arquivo...");
await sendSuccessReact(); // ✅
```

### 2. Estimativa de Tempo

Informe tempo estimado baseado no tamanho:
```javascript
const estimatedSeconds = Math.ceil(fileSizeInMB * 2); // ~2 segundos por MB
await sendText(`⏱️ Tempo estimado: ~${estimatedSeconds}s`);
```

### 3. Progresso Visual (Avançado)

Se o WhatsApp/Baileys suportar edição de mensagens:
```javascript
let progressMessage = await sendText("⬇️ Baixando: 0%");

// Atualizar durante o download
for (let i = 0; i <= 100; i += 10) {
  await updateMessage(progressMessage, `⬇️ Baixando: ${i}%`);
}
```

## 🐛 Tratamento de Erros Comum

### Erro: "Requested format not available"
**Causa:** Qualidade solicitada não disponível  
**Solução:** Usar fallback para qualidade menor automaticamente

### Erro: "HTTP Error 429: Too Many Requests"
**Causa:** Muitas requisições ao YouTube  
**Solução:** Implementar delay entre downloads ou usar proxy

### Erro: "Unable to extract video data"
**Causa:** Mudanças na API do YouTube  
**Solução:** Atualizar yt-dlp: `yt-dlp -U`

## 📚 Recursos Adicionais

### Formatos de Vídeo Suportados
- **MP4** - Mais compatível, recomendado
- **WEBM** - Menor tamanho, pode ter problemas de compatibilidade
- **MKV** - Alta qualidade, arquivos grandes

### Formatos de Áudio Suportados
- **MP3** - Mais compatível (recomendado)
- **M4A** - Boa qualidade, menor tamanho
- **OPUS** - Melhor qualidade/tamanho, menos compatível
- **WAV** - Sem perda, arquivos muito grandes

### Códigos de Qualidade de Áudio
- **0** - Melhor qualidade (~245 kbps)
- **2** - Alta qualidade (~190 kbps)
- **5** - Média qualidade (~130 kbps)
- **9** - Baixa qualidade (~65 kbps)

## 🎉 Conclusão

Seguindo estas práticas, você terá:
- ✅ Downloads mais rápidos e eficientes
- ✅ Melhor uso de recursos
- ✅ Experiência do usuário aprimorada
- ✅ Sistema mais seguro e confiável

**Lembre-se:** Sempre teste em um ambiente de desenvolvimento antes de aplicar em produção!
