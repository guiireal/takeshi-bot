# 📋 Refatoração dos Comandos de Download com yt-dlp

## 🎯 Resumo das Mudanças

Esta refatoração substitui a dependência da Spider X API para downloads de YouTube pelo uso direto do **yt-dlp**, uma ferramenta robusta e de código aberto para download de vídeos/áudios.

## ✅ Arquivos Criados

### 1. `src/services/ytdlpService.js`
Novo serviço que encapsula toda a lógica de interação com o yt-dlp.

**Principais funções:**
- `checkYtDlpInstalled()` - Verifica se o yt-dlp está instalado
- `getVideoInfo(url)` - Obtém informações de um vídeo sem fazer download
- `downloadMedia(url, type, qualityPreference)` - Faz download de áudio ou vídeo via URL
- `searchAndDownload(type, searchQuery, qualityPreference)` - Busca e baixa vídeo/áudio por termo
- `cleanupFile(filePath)` - Remove arquivos temporários

**Validações implementadas:**
- ✅ Limite de duração: 30 minutos (1800 segundos)
- ✅ Limite de tamanho: 100MB
- ✅ Verificação de instalação do yt-dlp
- ✅ Tratamento de erros específicos (vídeo indisponível, URL inválida, etc.)

**Recursos de segurança:**
- Downloads temporários em `assets/temp/`
- Limpeza automática de arquivos após envio
- Uso de timestamps únicos para evitar conflitos

## 🔄 Arquivos Refatorados

### 1. `src/commands/member/downloads/play-audio.js`
**Mudanças:**
- ❌ Removida dependência do `spider-x-api`
- ✅ Adicionado uso do `ytdlpService.searchAndDownload()`
- ✅ Download local com limpeza automática via `finally`
- ✅ Envio direto do arquivo via buffer em vez de URL
- ✅ Formatação melhorada da duração (mm:ss)
- ✅ Truncamento de descrições longas (200 caracteres)

### 2. `src/commands/member/downloads/play-video.js`
**Mudanças:**
- ❌ Removida dependência do `spider-x-api`
- ✅ Adicionado uso do `ytdlpService.searchAndDownload()`
- ✅ Qualidade de vídeo configurada para 720p
- ✅ Download local com limpeza automática
- ✅ Envio direto do arquivo via buffer
- ✅ Formatação melhorada de informações

### 3. `src/commands/member/downloads/yt-mp3.js`
**Mudanças:**
- ❌ Removida dependência do `spider-x-api`
- ✅ Adicionado uso do `ytdlpService.downloadMedia()`
- ✅ Validação melhorada de URLs (não apenas "you")
- ✅ Download local com limpeza automática
- ✅ Envio direto via buffer

### 4. `src/commands/member/downloads/yt-mp4.js`
**Mudanças:**
- ❌ Removida dependência do `spider-x-api`
- ✅ Adicionado uso do `ytdlpService.downloadMedia()`
- ✅ Qualidade configurada para 720p
- ✅ Validação melhorada de URLs
- ✅ Download local com limpeza automática
- ✅ Descrição corrigida (era "áudios", agora é "vídeos")

### 5. `README.md`
**Adições:**
- ✅ Nova seção "📦 Dependências Necessárias"
- ✅ Instruções de instalação do yt-dlp para Windows/Linux/Mac/Termux
- ✅ Instruções de instalação do ffmpeg
- ✅ Comandos de verificação de instalação
- ✅ Atualização do comando de instalação no Termux

## 🔧 Requisitos Técnicos

### Dependências Externas (devem ser instaladas no sistema):
1. **yt-dlp** - Para download de vídeos/áudios
2. **ffmpeg** - Para conversão de formatos (especialmente áudio para MP3)

### Instalação:

**Windows:**
```powershell
winget install yt-dlp
winget install ffmpeg
```

**Linux/Ubuntu/Debian:**
```bash
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && sudo chmod a+rx /usr/local/bin/yt-dlp
sudo apt install ffmpeg
```

**Termux (Android):**
```bash
pkg install python ffmpeg -y
pip install yt-dlp
```

## 📊 Comparação: Antes vs Depois

| Aspecto | Antes (Spider API) | Depois (yt-dlp) |
|---------|-------------------|-----------------|
| **Dependência externa** | API paga | Software open-source |
| **Custo** | Requer token API | Gratuito |
| **Controle** | Limitado pela API | Total controle |
| **Validações** | Lado do servidor | Lado do bot (mais controle) |
| **Limite de duração** | Definido pela API | 30 minutos (configurável) |
| **Limite de tamanho** | Definido pela API | 100MB (configurável) |
| **Formato de vídeo** | Fixo pela API | Configurável (720p atual) |
| **Sites suportados** | YouTube apenas | YouTube + 1000+ sites |
| **Tratamento de erros** | Genérico | Específico e detalhado |
| **Performance** | Dependente da API | Direto, sem intermediários |

## 🚀 Melhorias Implementadas

### 1. **Segurança e Validação**
- Validação de duração antes do download (evita downloads longos)
- Limite de tamanho configurado no yt-dlp
- Verificação de instalação antes de executar comandos
- Limpeza garantida de arquivos temporários via `finally`

### 2. **Experiência do Usuário**
- Mensagens de erro mais específicas e úteis
- Formatação melhorada de duração (mm:ss em vez de segundos)
- Descrições truncadas para não poluir o chat
- Feedback claro sobre requisitos não atendidos

### 3. **Manutenibilidade**
- Código centralizado em um único serviço
- Separação clara de responsabilidades
- Comentários JSDoc detalhados
- Tratamento de erros consistente

### 4. **Flexibilidade**
- Suporte a 1000+ sites além do YouTube
- Qualidade de vídeo configurável
- Fácil ajuste de limites (duração, tamanho)
- Possibilidade de adicionar novos formatos

## 🎨 Formato de Áudio/Vídeo

### Áudio (MP3)
- Formato: MP3
- Qualidade: Melhor disponível (qualidade 0)
- Codec: Extraído do melhor áudio disponível
- Mimetype: `audio/mpeg`

### Vídeo (MP4)
- Formato: MP4
- Qualidade: Até 720p (configurável)
- Codec: Melhor combinação vídeo+áudio disponível
- Mimetype: `video/mp4`
- Fallbacks para garantir compatibilidade

## 📝 Observações Importantes

### 1. **Mudança de Parâmetros nos Comandos**
Os comandos agora recebem parâmetros adicionais:
- `socket` - Para envio direto de mensagens
- `remoteJid` - ID do chat/grupo
- `webMessage` - Mensagem original (para quoted)

### 2. **Envio de Mídia**
A mudança mais significativa: em vez de usar `sendAudioFromURL()` e `sendVideoFromURL()`, agora:
- Download local do arquivo
- Leitura como buffer
- Envio direto via `socket.sendMessage()`
- Limpeza automática do arquivo

### 3. **Compatibilidade**
- Mantém o comportamento original dos comandos
- Mantém as mesmas mensagens para o usuário
- Mantém os mesmos aliases de comandos
- Interface idêntica para o usuário final

## 🔮 Possíveis Melhorias Futuras

### 1. **Feedback de Progresso**
Implementar análise do stdout do yt-dlp para mostrar:
- Porcentagem de download
- Velocidade
- Tempo estimado
- Atualização da mensagem em tempo real (se Baileys suportar)

**Exemplo de implementação:**
```javascript
ytdlp.stdout.on("data", (data) => {
  const output = data.toString();
  const progressMatch = output.match(/(\d+\.?\d*)%/);
  if (progressMatch) {
    const progress = progressMatch[1];
    // Atualizar mensagem do bot com progresso
  }
});
```

### 2. **Cache de Downloads**
Implementar sistema de cache para:
- Evitar downloads duplicados
- Melhorar performance
- Reduzir uso de banda

### 3. **Configurações por Grupo**
Permitir que administradores configurem:
- Qualidade preferida (360p, 480p, 720p, 1080p)
- Limite de duração personalizado
- Habilitar/desabilitar downloads

### 4. **Múltiplas Qualidades**
Oferecer opções de qualidade ao usuário:
```
/yt-mp4 [URL] 360p
/yt-mp4 [URL] 720p
/yt-mp4 [URL] 1080p
```

### 5. **Playlist Support**
Implementar suporte para playlists:
```
/yt-playlist [URL] - Download dos primeiros 5 vídeos
```

## 🐛 Possíveis Problemas e Soluções

### Problema 1: "yt-dlp não está instalado"
**Solução:**
```bash
# Verificar instalação
yt-dlp --version

# Se não estiver instalado, instalar conforme instruções no README
```

### Problema 2: "Arquivo muito grande"
**Solução:** 
- Vídeo ultrapassa 100MB
- Usuário deve tentar uma qualidade menor
- Ou administrador pode aumentar o limite em `ytdlpService.js`

### Problema 3: "Vídeo muito longo"
**Solução:**
- Vídeo ultrapassa 30 minutos
- Administrador pode aumentar em `ytdlpService.js` (MAX_DURATION_SECONDS)

### Problema 4: Erro de conversão de áudio
**Solução:**
```bash
# Verificar se ffmpeg está instalado
ffmpeg -version

# Instalar se necessário
```

### Problema 5: Permissões no diretório temp
**Solução:**
```bash
# Linux/Mac
chmod 755 assets/temp/

# Verificar se o diretório existe
ls -la assets/
```

## 📚 Recursos Adicionais

### Documentação yt-dlp:
- GitHub: https://github.com/yt-dlp/yt-dlp
- Wiki: https://github.com/yt-dlp/yt-dlp/wiki

### Sites Suportados:
- Lista completa: https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md
- Mais de 1000 sites incluindo: YouTube, Instagram, Facebook, Twitter, TikTok, etc.

## ✨ Conclusão

Esta refatoração torna o bot:
- ✅ **Independente** de APIs pagas
- ✅ **Mais robusto** com validações adequadas
- ✅ **Mais flexível** com controle total sobre downloads
- ✅ **Mais seguro** com limpeza automática de arquivos
- ✅ **Mais econômico** sem necessidade de tokens de API
- ✅ **Mais poderoso** com suporte a 1000+ sites

O código está pronto para uso em produção! 🚀
