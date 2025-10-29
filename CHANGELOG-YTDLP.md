# 📝 CHANGELOG - Refatoração yt-dlp

## [Versão 8.0.0] - 2024-12-XX

### 🎯 Mudanças Principais

**Sistema de Fila para Downloads:** Implementação de um sistema robusto de fila para processar downloads sequencialmente, eliminando conflitos causados por múltiplos downloads simultâneos.

### ✨ Novos Recursos

#### Sistema de Fila
- **Adicionado:** Sistema de fila em `src/services/ytdlpService.js`
  - Processamento sequencial de downloads
  - Prevenção de conflitos de arquivo
  - Fila automática com `addToQueue()`
  - Processamento assíncrono com `processQueue()`

#### Limpeza Automática
- **Adicionado:** `cleanupOldFiles()` em `ytdlpService.js`
  - Remove arquivos temporários com mais de 1 hora
  - Execução automática a cada 30 minutos
  - Preserva arquivos importantes (`.gitignore`, `wa-logs.txt`)
  - Logs detalhados de remoção

#### Gerenciamento de Fila
- **Adicionado:** `clearQueue()` - Limpa manualmente a fila
- **Adicionado:** `getQueueInfo()` - Retorna informações da fila

#### Novos Comandos
- **Adicionado:** `/limpar-fila` (`src/commands/admin/limpar-fila.js`)
  - Comando admin para limpar fila de downloads
  - Mostra estatísticas de operação
  - Aliases: `limparfila`, `clearqueue`

- **Adicionado:** `/fila` (`src/commands/member/fila.js`)
  - Comando member para ver status da fila
  - Mostra quantidade de downloads pendentes
  - Indica se está processando
  - Aliases: `queue`, `fila-status`

#### Documentação
- **Adicionado:** `SISTEMA-FILA-YTDLP.md`
  - Documentação completa do sistema de fila
  - Fluxo de funcionamento com diagramas
  - Guia de troubleshooting
  - Exemplos de uso dos comandos

### 🔄 Mudanças

#### `ytdlpService.js`
- **Modificado:** `downloadMedia()` - Agora usa sistema de fila
- **Modificado:** `searchAndDownload()` - Implementação inline com fila
- **Adicionado:** Variáveis `downloadQueue` e `isProcessingQueue`
- **Adicionado:** Funções de gerenciamento de fila
- **Adicionado:** Limpeza automática com `setInterval()`

### 📊 Melhorias

#### Performance
- ✅ Elimina conflitos de downloads simultâneos
- ✅ Processamento sequencial eficiente
- ✅ Limpeza automática libera espaço em disco
- ✅ Gerenciamento de memória otimizado

#### Estabilidade
- ✅ Previne corrupção de arquivos
- ✅ Evita race conditions
- ✅ Nomes de arquivo únicos com timestamp
- ✅ Tratamento robusto de erros

#### Monitoramento
- ✅ Logs detalhados de operações
- ✅ Comando para ver status da fila
- ✅ Comando admin para limpar fila
- ✅ Estatísticas em tempo real

### 🐛 Correções

- **Corrigido:** Conflitos causados por downloads simultâneos
- **Corrigido:** Acúmulo de arquivos temporários em `assets/temp/`
- **Corrigido:** Possíveis race conditions em downloads paralelos
- **Corrigido:** Arquivos órfãos não eram removidos

### 📝 Arquivos Afetados

```
Modificados:
  src/services/ytdlpService.js

Novos:
  src/commands/admin/limpar-fila.js
  src/commands/member/fila.js
  SISTEMA-FILA-YTDLP.md
```

---

## [Versão 7.0.0] - 2025-10-29

### 🎯 Mudanças Principais

Esta versão traz uma refatoração completa dos comandos de download, substituindo a dependência da Spider X API pelo uso direto do **yt-dlp**, tornando o bot mais independente, flexível e econômico.

---

## ✨ Novos Recursos

### Serviços
- **Adicionado:** `src/services/ytdlpService.js`
  - Serviço completo para gerenciar downloads via yt-dlp
  - Suporte a 1000+ sites além do YouTube
  - Validações robustas de duração e tamanho
  - Limpeza automática de arquivos temporários
  - Tratamento de erros específicos e detalhados

### Testes
- **Adicionado:** `src/test/ytdlpService.test.js`
  - Suite de testes para validar o ytdlpService
  - Testes de instalação, informações, validações e downloads

### Configurações
- **Adicionado em `src/config.js`:**
  - `YTDLP_MAX_DURATION` - Limite de duração (padrão: 1800s/30min)
  - `YTDLP_MAX_FILESIZE` - Limite de tamanho (padrão: 100M)
  - `YTDLP_DEFAULT_VIDEO_QUALITY` - Qualidade padrão (padrão: 720p)
  - `YTDLP_AUDIO_FORMAT` - Formato de áudio (padrão: mp3)
  - `YTDLP_AUDIO_QUALITY` - Qualidade de áudio (padrão: 0/melhor)

### Documentação
- **Adicionado:** `REFATORACAO-YTDLP.md`
  - Documentação técnica completa da refatoração
  - Comparação antes/depois
  - Detalhes de implementação
  - Possíveis melhorias futuras

- **Adicionado:** `GUIA-INSTALACAO-YTDLP.md`
  - Guia passo a passo para instalar yt-dlp e ffmpeg
  - Instruções para Windows, Linux, macOS e Termux
  - Solução de problemas comuns
  - Comandos de verificação e teste

- **Adicionado:** `DICAS-YTDLP.md`
  - Boas práticas de uso
  - Configurações recomendadas
  - Scripts de manutenção
  - Otimizações e segurança

- **Adicionado:** `RESUMO-REFATORACAO.md`
  - Resumo executivo das mudanças
  - Checklist de implementação
  - Próximos passos

---

## 🔄 Mudanças

### Comandos Refatorados

#### `src/commands/member/downloads/play-audio.js`
- **Removido:** Dependência do `spider-x-api`
- **Adicionado:** Uso do `ytdlpService.searchAndDownload()`
- **Melhorado:** Formatação de duração (mm:ss em vez de segundos)
- **Melhorado:** Truncamento de descrições longas (200 caracteres)
- **Melhorado:** Download local com limpeza automática via `finally`
- **Melhorado:** Envio direto via buffer em vez de URL

#### `src/commands/member/downloads/play-video.js`
- **Removido:** Dependência do `spider-x-api`
- **Adicionado:** Uso do `ytdlpService.searchAndDownload()`
- **Adicionado:** Configuração de qualidade de vídeo (usa config)
- **Melhorado:** Formatação de informações
- **Melhorado:** Download local com limpeza automática
- **Melhorado:** Envio direto via buffer

#### `src/commands/member/downloads/yt-mp3.js`
- **Removido:** Dependência do `spider-x-api`
- **Removido:** Validação simples "you" na URL
- **Adicionado:** Uso do `ytdlpService.downloadMedia()`
- **Melhorado:** Validação adequada de URLs (http/https)
- **Melhorado:** Download local com limpeza automática
- **Melhorado:** Tratamento de erros mais específico

#### `src/commands/member/downloads/yt-mp4.js`
- **Removido:** Dependência do `spider-x-api`
- **Removido:** Validação simples "you" na URL
- **Removido:** Descrição incorreta ("áudios" em vez de "vídeos")
- **Adicionado:** Uso do `ytdlpService.downloadMedia()`
- **Adicionado:** Configuração de qualidade (usa config)
- **Corrigido:** Descrição para "vídeos do YouTube"
- **Melhorado:** Validação adequada de URLs
- **Melhorado:** Download local com limpeza automática

### README.md
- **Adicionado:** Seção "📦 Dependências Necessárias"
  - Instruções de instalação do yt-dlp
  - Instruções de instalação do ffmpeg
  - Comandos para Windows, Linux, macOS e Termux
  - Comandos de verificação
- **Atualizado:** Comando de instalação no Termux (inclui python e yt-dlp)
- **Atualizado:** Instalação em VPS (inclui instalação do yt-dlp)

---

## 🗑️ Removido

### Dependências Externas
- **Spider X API** - Não é mais necessária para downloads (ainda disponível para outros comandos)
  - Os comandos `/play`, `/play-video`, `/yt-mp3`, `/yt-mp4` agora funcionam sem token da API

### Validações Antigas
- Validação simples de URL com `.includes("you")` - Substituída por validação adequada

---

## 🔧 Correções

### Bugs Corrigidos
- **Corrigido:** Descrição do comando `yt-mp4` (era "áudios", agora "vídeos")
- **Corrigido:** Validação fraca de URLs do YouTube
- **Corrigido:** Falta de limpeza de arquivos temporários em caso de erro
- **Corrigido:** Mensagens de erro genéricas (agora são específicas)

---

## 📊 Comparação: Antes vs Depois

| Aspecto | Antes (v6.5.1) | Depois (v7.0.0) |
|---------|----------------|-----------------|
| **API Externa** | Spider X API (paga) | yt-dlp (gratuito) |
| **Token necessário** | Sim | Não |
| **Sites suportados** | YouTube apenas | 1000+ sites |
| **Controle de qualidade** | Limitado | Total (configurável) |
| **Validação de duração** | Lado do servidor | Lado do cliente (30min) |
| **Validação de tamanho** | Lado do servidor | Lado do cliente (100MB) |
| **Limpeza de arquivos** | Não garantida | Automática (finally) |
| **Tratamento de erros** | Genérico | Específico e detalhado |
| **Formato de duração** | Segundos | mm:ss |
| **Descrições** | Completas | Truncadas (200 chars) |

---

## 🚀 Melhorias de Performance

- **Downloads diretos** - Sem intermediários de API
- **Arquivos temporários** - Limpeza automática libera espaço
- **Validações antecipadas** - Duração checada antes do download
- **Configurações centralizadas** - Fácil ajuste de limites

---

## 🔒 Melhorias de Segurança

- **Validação de URLs** - Apenas http/https aceitos
- **Limites configuráveis** - Duração e tamanho máximos
- **Limpeza garantida** - Arquivos sempre removidos (finally)
- **Erros específicos** - Não expõe detalhes internos

---

## 📦 Requisitos

### Dependências Novas (Sistema)
- **yt-dlp** - Para download de vídeos/áudios
  ```bash
  # Windows
  winget install yt-dlp
  
  # Linux/Mac
  sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && sudo chmod a+rx /usr/local/bin/yt-dlp
  
  # Termux
  pip install yt-dlp
  ```

- **ffmpeg** - Para conversões de formato
  ```bash
  # Windows
  winget install ffmpeg
  
  # Linux
  sudo apt install ffmpeg
  
  # Termux
  pkg install ffmpeg
  ```

### Dependências do Node.js
Nenhuma nova dependência npm foi adicionada! ✅

---

## ⚠️ Breaking Changes

### Comandos Afetados
Os seguintes comandos foram refatorados e agora requerem **yt-dlp** e **ffmpeg**:
- `/play` (ou `/play-audio`, `/pa`)
- `/play-video` (ou `/pv`)
- `/yt-mp3` (e aliases: `/youtube-mp3`, `/yt-audio`, `/youtube-audio`, `/mp3`)
- `/yt-mp4` (e aliases: `/youtube-mp4`, `/yt-video`, `/youtube-video`, `/mp4`)

### Comportamento Alterado
- **Validação de URLs do YouTube**: Agora mais rigorosa (http/https)
- **Formato de duração**: Exibido como mm:ss em vez de segundos
- **Descrições**: Truncadas em 200 caracteres
- **Qualidade de vídeo**: Padrão alterado para 720p (configurável)

### Configurações
Novas configurações em `src/config.js` devem ser ajustadas conforme necessário:
- `YTDLP_MAX_DURATION`
- `YTDLP_MAX_FILESIZE`
- `YTDLP_DEFAULT_VIDEO_QUALITY`
- `YTDLP_AUDIO_FORMAT`
- `YTDLP_AUDIO_QUALITY`

---

## 📝 Notas de Atualização

### Para Usuários
1. **Instale o yt-dlp e ffmpeg** (obrigatório)
2. Configure limites em `src/config.js` se desejar (opcional)
3. Teste os comandos de download
4. Em caso de problemas, consulte `GUIA-INSTALACAO-YTDLP.md`

### Para Desenvolvedores
1. Revise `REFATORACAO-YTDLP.md` para detalhes técnicos
2. Consulte `DICAS-YTDLP.md` para boas práticas
3. Execute testes: `node src/test/ytdlpService.test.js`
4. Considere as melhorias futuras sugeridas na documentação

---

## 🔮 Próximas Versões

### Planejado para v7.1.0
- [ ] Feedback de progresso durante downloads
- [ ] Sistema de cache para vídeos frequentes
- [ ] Suporte a playlists
- [ ] Configurações de qualidade por grupo

### Planejado para v7.2.0
- [ ] Compressão automática de vídeos grandes
- [ ] Fila de downloads para múltiplos usuários
- [ ] Rate limiting por usuário
- [ ] Estatísticas de uso

---

## 🤝 Contribuindo

Encontrou um bug ou tem uma sugestão? Abra uma issue no GitHub!

---

## 📚 Links Úteis

- **Documentação yt-dlp:** https://github.com/yt-dlp/yt-dlp
- **Sites Suportados:** https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md
- **ffmpeg:** https://ffmpeg.org/

---

## ✨ Agradecimentos

Obrigado a todos que contribuíram para esta versão e à comunidade open-source do yt-dlp!

---

**Versão completa:** 7.0.0  
**Data de lançamento:** 29 de Outubro de 2025  
**Autor:** Dev Gui
