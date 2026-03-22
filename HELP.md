# 🤖 TAKESHI BOT - Documentação Completa para IA

> **Última atualização:** 2 de Novembro de 2025  
> **Comandos documentados:** 110+ (detalhados tecnicamente)  
> **Estrutura técnica:** src/errors, src/middlewares, src/services incluídas  
> **Suporte a hosts:** Pterodactyl, Docker, VPS configurado  
> **Maintainer:** Dev Gui ([@devgui_](https://youtube.com/@devgui_))

---

## 📑 ÍNDICE

1. [Visão Geral](#-visão-geral)
2. [Arquitetura do Projeto](#-arquitetura-do-projeto)
3. [Arquivos da Raiz](#-arquivos-da-raiz)
4. [Como o Bot Funciona](#-como-o-bot-funciona)
5. [Sistema de Comandos](#-sistema-de-comandos)
6. [Configuração e Personalização](#-configuração-e-personalização)
7. [Scripts Utilitários](#-scripts-utilitários)
8. [Dependências e Tecnologias](#-dependências-e-tecnologias)
9. [Contribuindo](#-contribuindo)
10. [Licença](#-licença)

---

## 🎯 VISÃO GERAL

### O que é o Takeshi Bot?

O **Takeshi Bot** é um bot de WhatsApp **open source** e **multifuncional** construído com:
- **Baileys** (WhatsApp Web API) - v6.7.20
- **Node.js** - v22.19+
- Arquitetura **modular baseada em comandos**
- Sistema de **permissões por pasta**

### Filosofia do Projeto

```
"CASOS (CASES) NÃO EXISTEM MAIS! 🚫"
```

**Antes (Sistema de Cases - RUIM ❌):**
```javascript
// index.js com 20.000 linhas
switch(command) {
  case 'play':
    // 500 linhas de código aqui
    break;
  case 'sticker':
    // mais 500 linhas
    break;
  // ... centenas de cases
}
```

**Agora (Sistema de Comandos - BOM ✅):**
```
src/commands/
  ├── admin/play.js       (36 linhas)
  ├── member/sticker.js   (42 linhas)
  └── owner/exec.js       (89 linhas)
```

**Por que isso é melhor?**
- ✅ Código limpo e legível
- ✅ Fácil de debugar
- ✅ Manutenção simplificada
- ✅ Colaboração facilitada
- ✅ Permissões automáticas

---

## 🏗️ ARQUITETURA DO PROJETO

### Estrutura de Pastas (Raiz)

```
takeshi-bot/
├── 📁 .git/                    # Controle de versão Git
├── 📁 .github/                 # Configurações do GitHub
├── 📁 assets/                  # Arquivos de mídia e autenticação
├── 📁 database/                # Arquivos JSON (banco de dados)
├── 📁 node_modules/            # Dependências do Node.js
├── 📁 src/                     # CÓDIGO FONTE PRINCIPAL
├── 📄 .gitignore               # Arquivos ignorados pelo Git
├── 📄 CLAUDE.md                # Este arquivo (documentação para IA)
├── 📄 CONTRIBUTING.md          # Guia de contribuição
├── 📄 index.js                 # Ponto de entrada para hosts
├── 📄 LICENSE                  # Licença GPL-3.0
├── 📄 package.json             # Dependências e metadados
├── 📄 package-lock.json        # Lock de versões
├── 📄 README.md                # Documentação principal
├── 📄 reset-qr-auth.sh         # Script de reset de autenticação
├── 📄 update.sh                # Script de atualização automática
└── 📄 ⚡-cases-estao-aqui.js   # Easter egg explicativo
```

### Fluxo de Execução

```
┌─────────────────────────────────────────────────────────┐
│ 1. INÍCIO: index.js ou src/index.js                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. CONEXÃO: src/connection.js                          │
│    - Conecta com WhatsApp via Baileys                  │
│    - Gera QR Code ou usa código de pareamento          │
│    - Salva sessão em assets/auth/baileys/              │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. CARREGAMENTO: src/loader.js                         │
│    - Carrega middlewares (onMessagesUpsert, etc)       │
│    - Inicializa sistema de comandos dinâmicos          │
│    - Configura tratamento de erros                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 4. ESCUTA: Aguarda mensagens do WhatsApp               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 5. PROCESSAMENTO: src/middlewares/onMessagesUpsert.js  │
│    - Verifica se é comando (começa com prefixo)        │
│    - Extrai argumentos e metadados                     │
│    - Aplica restrições (mute, only-admin, etc)         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 6. EXECUÇÃO: src/utils/dynamicCommand.js               │
│    - Encontra comando correspondente                   │
│    - Verifica permissões (admin/owner)                 │
│    - Executa função handle() do comando                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 7. RESPOSTA: Envia mensagem de volta ao usuário        │
└─────────────────────────────────────────────────────────┘
```

---

## 📄 ARQUIVOS DA RAIZ

### 1. `index.js` - Ponto de Entrada

**Propósito:** Arquivo de entrada principal para facilitar execução em hosts que esperam `index.js` na raiz.

**O que faz:**
- Importa `src/connection.js` e `src/loader.js`
- Inicializa o bot chamando `connect()` e `load()`
- Configura handlers de erros globais
- Gerencia erros "Bad MAC" (erro comum do Baileys)

**Conteúdo principal:**
```javascript
import { connect } from "./src/connection.js";
import { load } from "./src/loader";
import { badMacHandler } from "./src/utils/badMacHandler.js";

async function startBot() {
  const socket = await connect();  // Conecta ao WhatsApp
  load(socket);                    // Carrega middlewares e comandos
}

startBot();
```

**Importante:** Este arquivo é **idêntico** ao `src/index.js`. Existe apenas por compatibilidade com hosts.

---

### 2. `⚡-cases-estao-aqui.js` - Easter Egg Educativo

**Propósito:** Arquivo educativo que explica a diferença entre sistema de "cases" (antigo) e sistema de comandos (novo).

**Mensagens principais:**
- Explica por que `switch/case` gigante é ruim
- Mostra onde ficam os comandos (`src/commands/`)
- Ensina sobre as 3 pastas de permissão:
  - `admin/` - Comandos administrativos
  - `member/` - Comandos para todos
  - `owner/` - Comandos do dono
- Indica o arquivo template: `🤖-como-criar-comandos.js`

**Citação importante:**
```
"Nós criamos código para HUMANOS, não para máquinas,
então, quanto mais simples, melhor!"
```

---

### 3. `package.json` - Metadados do Projeto

**Scripts disponíveis:**
```bash
npm start       # Inicia bot com --watch (reinicia em mudanças)
npm test        # Executa src/test.js
npm run test:all # Roda todos os testes do Node.js
```

---

### 4. `update.sh` - Script de Atualização Automática

**Propósito:** Atualiza o bot automaticamente via Git, com backups e merge inteligente.

**Funcionalidades:**
- ✅ Detecta ambiente (Termux, WSL2, VPS)
- ✅ Verifica dependências (git, node)
- ✅ Compara versão local vs remota
- ✅ Cria backup automático de alterações locais
- ✅ Mostra diferenças antes de aplicar
- ✅ Merge strategy inteligente (ort/recursive)
- ✅ Permite escolher ação em conflitos

**Como usar:**
```bash
bash update.sh
```

**Fluxo de execução:**
1. Verifica se é um repositório Git
2. Busca atualizações do remote (origin)
3. Compara versões (package.json)
4. Lista arquivos novos/modificados/deletados
5. Pergunta se quer criar backup
6. Aplica merge automático
7. Trata conflitos de forma interativa

**Estratégias de conflito:**
- **Opção 1:** Aceitar TUDO do repositório oficial (sobrescreve local)
- **Opção 2:** Manter TUDO local (não atualiza)
- **Opção 3:** Cancelar e resolver manualmente

---

### 5. `reset-qr-auth.sh` - Reset de Autenticação

**Propósito:** Remove arquivos de sessão do WhatsApp para reconectar o bot.

**O que faz:**
```bash
rm -rf ./assets/auth/baileys  # Deleta pasta de autenticação
```

**Quando usar:**
- ❌ Erro de conexão persistente
- ❌ "Bad MAC" não resolvido
- ❌ Bot não conecta mais
- ❌ Quer trocar número do bot

**Pós-execução:**
1. Remova dispositivo antigo no WhatsApp (Dispositivos Conectados)
2. Execute `npm start`
3. Digite número de telefone novamente
4. Use código de pareamento

---

### 6. `README.md` - Documentação Principal

**Conteúdo completo:**
- ✅ Instalação no Termux (Android)
- ✅ Instalação em VPS (Debian/Ubuntu)
- ✅ Instalação em Hosts (Bronxys, Nexfuture, etc)
- ✅ Configuração de API (Spider X API)
- ✅ Lista completa de funcionalidades
- ✅ 24 exemplos de envio de mensagens
- ✅ Tabela de comandos por categoria
- ✅ Troubleshooting de erros comuns
- ✅ Estrutura de pastas explicada

**Seções importantes:**
- **Atenção:** Alerta sobre vendedores fraudulentos
- **Sobre:** Disclaimer de uso responsável
- **Instalação:** Guias passo a passo
- **Funcionalidades:** Tabela com todos os comandos
- **Auto-responder:** Sistema de respostas automáticas
- **Erros comuns:** Soluções para problemas frequentes

---

### 7. `CONTRIBUTING.md` - Guia de Contribuição

**Template obrigatório para PRs:**

```markdown
### Tipo de mudança
- [ ] 🐛 Bug fix
- [ ] ✨ Nova funcionalidade
- [ ] 💥 Breaking change
- [ ] ♻️ Refatoração
- [ ] 📚 Documentação

### Checklist obrigatório
- [ ] Testado no Node.js 22
- [ ] Inclui prints do comando funcionando
- [ ] Usa funções existentes da pasta utils
- [ ] Importa CommandHandleProps corretamente
```

**Regras importantes:**
- ✅ Use template de comandos
- ✅ Teste no Node.js 22
- ✅ Inclua screenshots
- ✅ Siga estrutura de pastas
- ❌ Não reinvente funções
- ❌ Não ignore template
- ❌ Não misture múltiplas funcionalidades

---

### 8. `LICENSE` - GPL-3.0

**Licença:** GNU General Public License v3.0

**Direitos garantidos:**
- ✅ Usar para qualquer propósito
- ✅ Modificar o código
- ✅ Distribuir cópias
- ✅ Distribuir versões modificadas

**Obrigações:**
- ⚠️ Manter créditos ao autor original
- ⚠️ Disponibilizar código-fonte modificado
- ⚠️ Usar mesma licença GPL-3.0
- ⚠️ Não pode tornar proprietário (fechado)

**Autor:** Guilherme França - Dev Gui  

---

### 9. `.gitignore` - Arquivos Ignorados

**Propósito:** Define quais arquivos o Git NÃO deve versionar.

**Principais exclusões:**
```
node_modules/              # Dependências (reinstaladas com npm install)
assets/auth/baileys/       # Sessão do WhatsApp (privada)
assets/temp/               # Arquivos temporários
.env                       # Variáveis de ambiente
package-lock.json          # Lock de versões (opcional)
```

---

## 🤖 COMO O BOT FUNCIONA

### Sistema de Permissões por Pasta

```
src/commands/
│
├── 📁 owner/              # 🔐 DONO DO BOT/GRUPO
│   ├── exec.js           # Executar comandos shell
│   ├── get-group-id.js         # Obter ID do grupo
│   ├── off.js            # Desligar bot no grupo
│   ├── on.js             # Ligar bot no grupo
│   ├── set-menu-image.js
│   ├── set-prefix.js
│   └── set-spider-api-token.js
│
├── 📁 admin/              # 👮 ADMINISTRADORES
│   ├── abrir.js          # Abrir grupo
│   ├── fechar.js         # Fechar grupo
│   ├── ban.js            # Banir membro
│   ├── promover.js       # Promover a admin
│   ├── rebaixar.js       # Rebaixar admin
│   ├── mute.js           # Mutar membro
│   ├── unmute.js         # Desmutar
│   ├── anti-link.js      # Anti-link (1/0)
│   ├── anti-audio.js
│   ├── anti-document.js
│   ├── anti-image.js
│   ├── anti-video.js
│   ├── anti-sticker.js
│   ├── auto-sticker.js   # Auto-sticker (1/0)
│   ├── welcome.js        # Boas-vindas (1/0)
│   ├── exit.js           # Despedida (1/0)
│   ├── auto-responder.js
│   └── ... (30+ comandos)
│
└── 📁 member/             # 👥 TODOS OS MEMBROS
    ├── menu.js
    ├── ping.js
    ├── sticker.js
    ├── to-image.js
    ├── to-mp3.js
    ├── attp.js           # Sticker animado
    ├── ttp.js            # Sticker texto
    │
    ├── 📁 downloads/      # Download de mídia
    │   ├── instagram.js
    │   ├── play-audio.js
    │   ├── play-video.js
    │   ├── tik-tok.js
    │   ├── yt-mp3.js
    │   └── yt-mp4.js
    │
    ├── 📁 ia/             # Inteligência Artificial
    │   ├── gemini.js
    │   ├── gpt-5-mini.js
    │   ├── flux.js
    │   └── ia-sticker.js
    │
    ├── 📁 canvas/         # Manipulação de imagens
    │   ├── blur.js
    │   ├── bolsonaro.js
    │   ├── cadeia.js
    │   ├── contraste.js
    │   ├── espelhar.js
    │   ├── gray.js
    │   ├── inverter.js
    │   ├── pixel.js
    │   └── rip.js
    │
    ├── 📁 funny/          # Diversão
    │   ├── dado.js
    │   ├── abracar.js
    │   ├── beijar.js
    │   ├── lutar.js
    │   ├── matar.js
    │   └── socar.js
    │
    └── 📁 exemplos/       # 24 exemplos de código
        ├── exemplos-de-mensagens.js
        ├── enviar-audio-de-arquivo.js
        ├── enviar-audio-de-url.js
        ├── enviar-audio-de-buffer.js
        ├── enviar-imagem-de-arquivo.js
        ├── enviar-video-de-url.js
        ├── enviar-sticker-de-buffer.js
        ├── enviar-documento-de-arquivo.js
        ├── enviar-gif-de-url.js
        ├── enviar-enquete.js
        ├── enviar-localizacao.js
        ├── enviar-contato.js
        └── ... (24 arquivos totais)
```

**Nota importante:** O desenvolvedor **NÃO precisa** verificar permissões manualmente. Basta colocar o comando na pasta correta!

---

### Sistema de Database (JSON)

**Localização:** `database/` (arquivos JSON)

**Arquivos principais:**

| Arquivo | Propósito |
|---------|-----------|
| `config.json` | Configurações runtime (prefixo, tokens, números) |
| `anti-link-groups.json` | Grupos com anti-link ativo |
| `auto-responder.json` | Pares de pergunta/resposta |
| `auto-responder-groups.json` | Grupos com auto-responder ativo |
| `auto-sticker-groups.json` | Grupos com auto-sticker ativo |
| `exit-groups.json` | Grupos com mensagem de saída ativa |
| `inactive-groups.json` | Grupos onde bot está desligado |
| `muted.json` | Membros mutados por grupo |
| `only-admins.json` | Grupos onde só admins usam bot |
| `prefix-groups.json` | Prefixo personalizado por grupo |
| `welcome-groups.json` | Grupos com boas-vindas ativa |
| `group-restrictions.json` | Restrições de tipo de mensagem |
| `restricted-messages.json` | Tipos de mensagens restritas |

**Exemplo - `auto-responder.json`:**
```json
[
  {
    "match": "Oi",
    "answer": "Olá, tudo bem?"
  },
  {
    "match": "Qual seu nome",
    "answer": "Meu nome é Takeshi Bot"
  }
]
```

**Acesso via `src/utils/database.js`:**
```javascript
// ❌ NUNCA faça isso:
// import fs from 'fs';
// const data = JSON.parse(fs.readFileSync('database/config.json'));

// ✅ SEMPRE faça isso:
import { getPrefix } from './utils/database';
const prefix = getPrefix(groupLid);  // Busca no DB, fallback para config
```

---

## ⚙️ CONFIGURAÇÃO E PERSONALIZAÇÃO

### Arquivo `src/config.js`

**Configurações principais:**

```javascript
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prefixo padrão dos comandos.
export const PREFIX = "/";

// Emoji do bot (mude se preferir).
export const BOT_EMOJI = "🤖";

// Nome do bot (mude se preferir).
export const BOT_NAME = "Takeshi Bot";

// LID do bot.
// Para obter o LID do bot, use o comando <prefixo>lid respondendo em cima de uma mensagem do número do bot
// Troque o <prefixo> pelo prefixo do bot (ex: /lid).
export const BOT_LID = "12345678901234567890@lid";

// LID do dono do bot.
// Para obter o LID do dono do bot, use o comando <prefixo>meu-lid
// Troque o <prefixo> pelo prefixo do bot (ex: /meu-lid).
export const OWNER_LID = "12345678901234567890@lid";

// Diretório dos comandos
export const COMMANDS_DIR = path.join(__dirname, "commands");

// Diretório de arquivos de mídia.
export const DATABASE_DIR = path.resolve(__dirname, "..", "database");

// Diretório de arquivos de mídia.
export const ASSETS_DIR = path.resolve(__dirname, "..", "assets");

// Diretório de arquivos temporários.
export const TEMP_DIR = path.resolve(__dirname, "..", "assets", "temp");

// Timeout em milissegundos por evento (evita banimento).
export const TIMEOUT_IN_MILLISECONDS_BY_EVENT = 700;

// Plataforma de API's
export const SPIDER_API_BASE_URL = "https://api.spiderx.com.br/api";

// Obtenha seu token, criando uma conta em: https://api.spiderx.com.br.
export const SPIDER_API_TOKEN = "seu_token_aqui";

// Plataforma Linker (upload de imagens e geração de link).
export const LINKER_BASE_URL = "https://linker.devgui.dev/api";

// Obtenha sua chave em: https://linker.devgui.dev.
export const LINKER_API_KEY = "seu_token_aqui";

// Caso queira responder apenas um grupo específico,
// coloque o ID dele na configuração abaixo.
// Para saber o ID do grupo, use o comando <prefixo>get-group-id
// Troque o <prefixo> pelo prefixo do bot (ex: /get-group-id).
export const ONLY_GROUP_ID = "";

// Configuração para modo de desenvolvimento
// mude o valor para ( true ) sem os parênteses
// caso queira ver os logs de mensagens recebidas
export const DEVELOPER_MODE = false;

// Caso queira usar proxy.
export const PROXY_PROTOCOL = "http";
export const PROXY_HOST = "";
export const PROXY_PORT = "";
export const PROXY_USERNAME = "";
export const PROXY_PASSWORD = "";

// Chave da OpenAI para o comando de suporte
export const OPENAI_API_KEY =
  "";
```

**Comandos para configurar em runtime:**

```bash
/set-prefix #              # Muda prefixo do grupo
/set-spider-api-token ...  # Define token da API
```

**Observação:** a API Key do Linker é configurada diretamente em `src/config.js` e é usada pelos comandos de **canvas** e **gerar-link**.

---

### Personalização do Menu

**Arquivo:** `src/menu.js`

**Estrutura:**
```javascript
export function menuMessage(groupJid) {
  const prefix = getPrefix(groupJid);  // Prefixo do grupo
  
  return `╭━━⪩ BEM VINDO! ⪨━━
▢
▢ • ${BOT_NAME}
▢ • Prefixo: ${prefix}
▢ • Versão: ${packageInfo.version}
▢
╰━━─「🪐」─━━

╭━━⪩ DONO ⪨━━
▢ • ${prefix}exec
▢ • ${prefix}get-group-id
▢ • ${prefix}off
▢ • ${prefix}on
╰━━─「🌌」─━━

... (continua)
`;
};
```

**Como alterar:**
1. Edite `src/menu.js`
2. Mantenha tudo dentro das **crases** (template string)
3. Use `${prefix}` para mostrar prefixo dinâmico
4. Reinicie o bot (se não estiver com `--watch`)

---

### Mensagens de Boas-vindas

**Arquivo:** `src/messages.js`

```javascript
export const welcomeMessage = "Seja bem vindo ao nosso grupo, @member!";
export const exitMessage = "Poxa, @member saiu do grupo... Sentiremos sua falta!";
```

**Tags especiais:**
- `@member` - Substitui por menção ao usuário

**Ativação:**
```bash
/welcome 1   # Ativa boas-vindas
/exit 1      # Ativa mensagem de saída
```

---

## 🛠️ SCRIPTS UTILITÁRIOS

### `update.sh` - Atualização Automática

**Comandos internos principais:**
```bash
detect_environment()      # Detecta Termux/WSL/VPS
check_dependencies()      # Verifica git, node
check_git_repo()          # Valida repositório Git
get_version()             # Extrai versão do package.json
create_backup()           # Backup de alterações locais
show_file_differences()   # Mostra diff antes de aplicar
apply_updates()           # Aplica merge com estratégia
```

**Uso:**
```bash
bash update.sh
```

**Saída esperada:**
```
🤖 SCRIPT DE ATUALIZAÇÃO TAKESHI BOT
📱 Ambiente: Termux (Android)

📊 INFORMAÇÕES DE VERSÃO:
  📦 Sua versão:     6.5.0
  🌐 Versão oficial: 6.6.0

⚠️  Você tem alterações locais não salvas!
Deseja criar um backup das suas alterações antes de continuar? (s/n):
```

---

### `reset-qr-auth.sh` - Reset de Autenticação

**Uso:**
```bash
bash reset-qr-auth.sh
```

**Confirmação necessária:**
```
⚠️  ATENÇÃO: Esta ação irá remover todos os arquivos de autenticação do bot!
Deseja continuar? (s/N):
```

**Pós-execução:**
```
📝 Próximos passos:
   1. Execute 'npm start' para iniciar o bot
   2. Digite seu número de telefone quando solicitado
   3. Use o código de pareamento no WhatsApp
```

---

## 📦 DEPENDÊNCIAS E TECNOLOGIAS

### NPM Packages

| Package | Versão | Uso |
|---------|--------|-----|
| `@cacheable/node-cache` | ^1.7.4 | Cache avançado |
| `axios` | ^1.13.0 | Requisições HTTP (downloads, APIs) |
| `baileys` | ^6.7.20 | WhatsApp Web API (conexão principal) |
| `correios-brasil` | ^3.0.6 | Consulta CEP brasileiro |
| `fluent-ffmpeg` | ^2.1.3 | Conversão áudio/vídeo |
| `node-cache` | ^5.1.2 | Cache em memória (metadados grupo) |
| `node-webpmux` | ^3.2.1 | Criação/edição de stickers WebP |
| `openai` | ^5.11.0 | Integração ChatGPT/GPT-4 |
| `pino` | ^9.7.0 | Logger performático |
| `tiktoken` | ^1.0.21 | Contagem de tokens (IA) |

### Tecnologias Externas

**Spider X API** (https://api.spiderx.com.br)
- TikTok downloader
- YouTube downloader
- Google Gemini AI
- Flux AI (geração de imagens)
- IA Sticker
- Google Search
- ATTP (animated text to picture)

**FFmpeg**
- Conversão de formatos de áudio
- Conversão para Opus (PTT - Push to Talk)
- Extração de áudio de vídeo

**Node.js**
- Versão recomendada: **22.19+**
- Mínima suportada: **22.0.0**

---

## 🚀 CASOS DE USO

### Para Usuários Finais

**O que o bot pode fazer:**
- ✅ Download de vídeos (TikTok, YouTube)
- ✅ Criação de figurinhas (imagem, GIF, vídeo)
- ✅ Conversas com IA (Google Gemini)
- ✅ Geração de imagens com IA (Flux)
- ✅ Edição de imagens (blur, pixel, P&B, etc)
- ✅ Jogos e diversão (dado, abraço, tapa, etc)
- ✅ Consultas (CEP, busca YouTube)
- ✅ Gerenciamento de grupo (ban, mute, anti-link)
- ✅ Auto-respostas personalizadas
- ✅ Boas-vindas com imagem personalizada

### Para Desenvolvedores

**Como usar este repositório:**
- ✅ Base para criar seu próprio bot
- ✅ Aprenda arquitetura modular
- ✅ Exemplos de integração com APIs
- ✅ Referência de uso do Baileys
- ✅ Estrutura para contribuir com PRs

### Para IAs (LLMs)

**Como assistir usuários:**
1. **Criação de comandos:** Use template `🤖-como-criar-comandos.js`
2. **Debugging:** Verifique `src/utils/logger.js` e `assets/temp/wa-logs.txt`
4. **Permissões:** Crie comando na pasta correta (admin/member/owner)
5. **Database:** Use funções de `src/utils/database.js`, nunca leia JSON diretamente
6. **Tipos:** Consulte `src/@types/index.d.ts` para CommandHandleProps

---

## 🎨 CUSTOM MIDDLEWARE - PERSONALIZAÇÃO SEM MODIFICAR CORE

### Conceito

O `src/middlewares/customMiddleware.js` é um **ponto de injeção seguro** para customizações sem modificar arquivos principais do bot.

**Por que usar?**
- ✅ Evita conflitos em atualizações do bot
- ✅ Mantém código customizado separado
- ✅ Acesso total às funções do bot
- ✅ Hooks em pontos estratégicos

### Arquitetura de Hooks

```
┌─────────────────────────────────────────────────────────┐
│ onMessagesUpsert.js - Processa TODAS as mensagens      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ HOOK 1: customMiddleware({ type: "message" })          │
│ - Executado ANTES de processar comandos                │
│ - Tem acesso a commonFunctions                         │
│ - Pode interceptar/modificar comportamento             │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ dynamicCommand() - Processa comandos normalmente       │
└─────────────────────────────────────────────────────────┘

                          OU

┌─────────────────────────────────────────────────────────┐
│ HOOK 2: customMiddleware({ type: "participant" })      │
│ - Executado ANTES de processar add/remove              │
│ - commonFunctions é null                               │
│ - Pode adicionar lógica extra                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ onGroupParticipantsUpdate() - Processa eventos         │
└─────────────────────────────────────────────────────────┘
```

### Assinatura da Função

```javascript
export async function customMiddleware({
  socket,           // Socket do Baileys
  webMessage,       // Mensagem completa do WhatsApp
  type,             // "message" | "participant"
  commonFunctions,  // Object | null (null em eventos de participantes)
  action,           // "add" | "remove" (apenas em type: "participant")
  data,             // String (dados do participante)
}) {
  // Sua lógica aqui
}
```

### Exemplos Técnicos Avançados

#### 1. Sistema de Boas-vindas Personalizado por Grupo

```javascript
export async function customMiddleware({ type, action, commonFunctions, webMessage }) {
  if (type !== "participant" || action !== "add") return;

  const gruposVIP = {
    "120363025800347367@g.us": {
      mensagem: "🌟 Bem-vindo ao Grupo VIP Premium!",
      regras: "📋 Leia as regras fixadas!"
    },
    "120363123456789012@g.us": {
      mensagem: "👋 Olá! Seja bem-vindo ao nosso grupo!",
      regras: null
    }
  };

  const grupoAtual = webMessage.key.remoteJid;
  const config = gruposVIP[grupoAtual];

  if (!config) return; // Grupo não está na lista

  await socket.sendMessage(grupoAtual, {
    text: config.mensagem
  });

  if (config.regras) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await socket.sendMessage(grupoAtual, {
      text: config.regras
    });
  }
}
```

#### 2. Auto-reação a Comandos Específicos

```javascript
export async function customMiddleware({ type, commonFunctions, webMessage, socket }) {
  if (type !== "message" || !commonFunctions) return;

  const { command } = commonFunctions;

  const reacoesComandos = {
    "play": "🎵",
    "sticker": "🎨",
    "gemini": "🤖",
    "ban": "🔨",
    "menu": "📋"
  };

  const emoji = reacoesComandos[command];

  if (emoji) {
    await socket.sendMessage(webMessage.key.remoteJid, {
      react: { text: emoji, key: webMessage.key }
    });
  }
}
```

#### 3. Sistema de Log Avançado

```javascript
import fs from "node:fs";
import path from "node:path";

export async function customMiddleware({ type, commonFunctions, webMessage, action }) {
  const logDir = path.resolve("./logs");
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

  const hoje = new Date().toISOString().split('T')[0];
  const logFile = path.join(logDir, `${hoje}.log`);

  let logEntry = "";

  if (type === "message" && commonFunctions) {
    const { command, args, userMessageText, remoteJid } = commonFunctions;
    logEntry = `[${new Date().toISOString()}] MESSAGE | Grupo: ${remoteJid} | Comando: ${command || "N/A"} | Args: ${args.join(", ")} | Texto: ${userMessageText}\n`;
  } else if (type === "participant") {
    const { remoteJid } = webMessage.key;
    logEntry = `[${new Date().toISOString()}] PARTICIPANT | Grupo: ${remoteJid} | Ação: ${action} | Dados: ${JSON.stringify(data)}\n`;
  }

  fs.appendFileSync(logFile, logEntry);
}
```

#### 4. Bloqueio de Comandos em Horários Específicos

```javascript
export async function customMiddleware({ type, commonFunctions }) {
  if (type !== "message" || !commonFunctions) return;

  const { command, sendWarningReply } = commonFunctions;

  // Comandos bloqueados entre 22h e 6h
  const comandosBloqueados = ["play", "yt-mp3", "yt-mp4"];
  const horaAtual = new Date().getHours();

  if (comandosBloqueados.includes(command) && (horaAtual >= 22 || horaAtual < 6)) {
    await sendWarningReply("⏰ Este comando está bloqueado entre 22h e 6h!");
    throw new Error("Comando bloqueado por horário");
  }
}
```

#### 5. Contador de Uso de Comandos

```javascript
import fs from "node:fs";
import path from "node:path";

const statsFile = path.resolve("./database/command-stats.json");

function loadStats() {
  if (!fs.existsSync(statsFile)) return {};
  return JSON.parse(fs.readFileSync(statsFile, "utf-8"));
}

function saveStats(stats) {
  fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
}

export async function customMiddleware({ type, commonFunctions }) {
  if (type !== "message" || !commonFunctions) return;

  const { command } = commonFunctions;
  if (!command) return;

  const stats = loadStats();
  stats[command] = (stats[command] || 0) + 1;
  saveStats(stats);
}
```

#### 6. Respostas Automáticas Inteligentes

```javascript
export async function customMiddleware({ type, commonFunctions, socket, webMessage }) {
  if (type !== "message" || !commonFunctions) return;

  const { userMessageText, command } = commonFunctions;
  
  // Só responde se NÃO for um comando
  if (command) return;

  const respostas = {
    "bom dia": "☀️ Bom dia! Como posso ajudar?",
    "boa tarde": "🌤️ Boa tarde! Em que posso ser útil?",
    "boa noite": "🌙 Boa noite! Precisa de algo?",
    "obrigado": "😊 Por nada! Estou aqui para ajudar!",
    "valeu": "👍 Disponha!"
  };

  const textoLower = userMessageText?.toLowerCase() || "";

  for (const [trigger, resposta] of Object.entries(respostas)) {
    if (textoLower.includes(trigger)) {
      await socket.sendMessage(webMessage.key.remoteJid, {
        text: resposta
      });
      break;
    }
  }
}
```

### Acesso ao commonFunctions

Quando `type === "message"`, você tem acesso completo a todas as funções do bot:

```javascript
const {
  // Identificação
  botNumber,
  remoteJid,
  isGroup,
  
  // Comando
  command,
  prefix,
  args,
  fullArgs,
  
  // Mensagem
  userMessageText,
  webMessage,
  
  // Tipos de mensagem
  isImage,
  isVideo,
  isSticker,
  isAudio,
  // ... e muitos outros
  
  // Funções de envio
  sendReply,
  sendSuccessReply,
  sendErrorReply,
  sendWarningReply,
  sendText,
  sendReact,
  
  // Funções de mídia
  sendImageFromURL,
  sendVideoFromBuffer,
  sendAudioFromFile,
  // ... todas as 50+ funções disponíveis
  
  // Funções de grupo
  getGroupAdmins,
  getGroupMetadata,
  isOwner,
  isGroupAdmin,
  
  // Downloads
  downloadImage,
  downloadVideo,
  downloadSticker,
  // ... etc
} = commonFunctions;
```

### Boas Práticas

**✅ Fazer:**
- Verificar `type` antes de acessar propriedades
- Validar `commonFunctions` não é null
- Usar try/catch para erros
- Documentar lógica customizada
- Retornar cedo quando não aplicável

**❌ Evitar:**
- Modificar `webMessage` diretamente
- Bloquear execução com loops infinitos
- Fazer chamadas síncronas bloqueantes
- Lançar erros sem tratamento
- Modificar arquivos core do bot

### Debugging

```javascript
export async function customMiddleware(params) {
  // Log completo dos parâmetros
  console.log("[CustomMiddleware]", JSON.stringify({
    type: params.type,
    action: params.action,
    hasCommonFunctions: !!params.commonFunctions,
    command: params.commonFunctions?.command,
    remoteJid: params.webMessage?.key?.remoteJid
  }, null, 2));
  
  // Sua lógica aqui
}
```

---

## 🔧 CONTRIBUINDO

### Checklist para PRs

**Obrigatório:**
- [ ] Testado no Node.js 22
- [ ] Screenshots do comando funcionando
- [ ] Usa template de comandos
- [ ] Importa `CommandHandleProps`
- [ ] Comentários em português
- [ ] Segue uma responsabilidade por PR

**Boas práticas:**
- ✅ Commits semânticos: `feat:`, `fix:`, `refactor:`
- ✅ PRs pequenos (mais fácil revisar)
- ✅ Descrever o "por quê", não só o "o quê"
- ✅ Incluir exemplos de uso

**Template do PR:**
```markdown
## Tipo de mudança
- [ ] 🐛 Bug fix
- [ ] ✨ Nova funcionalidade

## Descrição
[Explique o que foi feito e por quê]

## Screenshots
[Cole prints aqui]

## Checklist
- [ ] Testado no Node.js 22
- [ ] Inclui prints
- [ ] Usa CommandHandleProps
```

---

## 📜 LICENÇA

**Tipo:** GPL-3.0 (GNU General Public License v3)

**Resumo:**
- ✅ **Permitido:** Usar, modificar, distribuir comercialmente
- ⚠️ **Obrigação:** Manter código aberto, mesma licença
- ❌ **Proibido:** Tornar proprietário/fechado

**Autor:** Guilherme França (Dev Gui)  
**Copyright:** © 2024

**Texto completo:** https://www.gnu.org/licenses/gpl-3.0.html

---

## 📞 SUPORTE E COMUNIDADE

**Canal do YouTube:**  
[@devgui_](https://www.youtube.com/@devgui_?sub_confirmation=1)

**Repositórios em outros idiomas:**
- 🇺🇸 [English version](https://github.com/guiireal/takeshi-bot-english)
- 🇪🇸 [Versión en Español](https://github.com/guiireal/takeshi-bot-espanol)
- 🇮🇩 [Versi Bahasa Indonesia](https://github.com/guiireal/takeshi-bot-bahasa-indonesia)

**Hosts parceiras:**
- [Bronxys](https://bronxyshost.com/)
- [Nexfuture](https://nexfuture.com.br/)
- [Speed Cloud](https://speedhosting.cloud/)

---

## ⚠️ DISCLAIMER

**IMPORTANTE:**
- ⚠️ Este projeto **NÃO** tem vínculo oficial com o WhatsApp
- ⚠️ Use de forma **responsável** e conforme ToS do WhatsApp
- ⚠️ O bot é **100% gratuito** - se você pagou, foi enganado
- ⚠️ Não nos responsabilizamos por uso indevido
- ⚠️ Única coisa paga é a Spider X API (opcional)

---

## 📋 CATÁLOGO COMPLETO DE COMANDOS

### 🔐 COMANDOS OWNER (8 comandos)
*Exclusivos para o dono do bot*

| Comando | Aliases | Função | Uso Técnico |
|---------|---------|--------|-------------|
| **exec** | - | Executa comandos shell no servidor | `${PREFIX}exec ls -la` - Proteções contra comandos destrutivos |
| **get-group-id** | get-group-id, id-get, id-group | Obtém LID completo do grupo | `${PREFIX}get-group-id` - Retorna remoteJid para configurações |
| **off** | - | Desativa bot no grupo específico | `${PREFIX}off` - Adiciona grupo à `inactive-groups.json` |
| **on** | - | Ativa bot no grupo específico | `${PREFIX}on` - Remove grupo da `inactive-groups.json` |
| **set-menu-image** | altera-imagem-menu, etc | Substitui imagem do menu | `${PREFIX}set-menu-image` (responder imagem) - Salva em `assets/images/` |
| **set-prefix** | altera-prefix, muda-prefix, etc | Define prefixo para grupo | `${PREFIX}set-prefix =` - Atualiza `prefix-groups.json` |
| **set-spider-api-token** | altera-token, muda-token, etc | Configura token da Spider X API | `${PREFIX}set-spider-api-token TOKEN` - Atualiza `config.json` |

### 👮 COMANDOS ADMIN (30+ comandos)
*Para administradores de grupo*

#### **Gerenciamento de Membros**
| Comando | Aliases | Função | Uso Técnico |
|---------|---------|--------|-------------|
| **ban** | kick | Remove membro do grupo | `${PREFIX}ban @user` - Usa `socket.groupParticipantsUpdate()` |
| **promover** | promove, promote, add-adm | Promove a administrador | `${PREFIX}promover @user` - Adiciona privilégios admin |
| **rebaixar** | rebaixa, demote | Rebaixa admin para membro | `${PREFIX}rebaixar @user` - Remove privilégios admin |
| **mute** | mutar | Silencia membro (delete automático) | `${PREFIX}mute @user` - Adiciona à `muted.json` |
| **unmute** | desmutar | Remove silenciamento | `${PREFIX}unmute @user` - Remove da `muted.json` |

#### **Controle de Grupo**
| Comando | Aliases | Função | Uso Técnico |
|---------|---------|--------|-------------|
| **abrir** | - | Abre grupo (todos podem enviar) | `${PREFIX}abrir` - `socket.groupSettingUpdate()` |
| **fechar** | - | Fecha grupo (só admins enviam) | `${PREFIX}fechar` - Restringe envio de mensagens |
| **limpar** | limpa, clear, clear-chat | Limpa histórico do chat | `${PREFIX}limpar` - Delete múltiplas mensagens |
| **link-grupo** | link-gp | Obtém link de convite | `${PREFIX}link-grupo` - `socket.groupInviteCode()` |
| **only-admin** | so-admin, so-adm | Bot responde só para admins | `${PREFIX}only-admin 1` - Atualiza `only-admins.json` |

#### **Sistema Anti-Spam**
| Comando | Aliases | Função | Uso Técnico |
|---------|---------|--------|-------------|
| **anti-link** | - | Bloqueia links no grupo | `${PREFIX}anti-link 1` - Middleware detecta URLs |
| **anti-audio** | anti-audios | Bloqueia áudios | `${PREFIX}anti-audio 1` - Filtra por `messageType` |
| **anti-document** | anti-doc | Bloqueia documentos | `${PREFIX}anti-document 1` - Detecta arquivos |
| **anti-image** | anti-img | Bloqueia imagens | `${PREFIX}anti-image 1` - Filtra mídia visual |
| **anti-video** | anti-vid | Bloqueia vídeos | `${PREFIX}anti-video 1` - Detecta formato MP4/etc |
| **anti-sticker** | anti-fig | Bloqueia figurinhas | `${PREFIX}anti-sticker 1` - Filtra WebP/stickers |
| **anti-event** | - | Bloqueia eventos do WhatsApp | `${PREFIX}anti-event 1` - Filtra event messages |
| **anti-product** | - | Bloqueia catálogo de produtos | `${PREFIX}anti-product 1` - Filtra product messages |

#### **Auto-Responder**
| Comando | Aliases | Função | Uso Técnico |
|---------|---------|--------|-------------|
| **auto-responder** | - | Ativa/desativa sistema | `${PREFIX}auto-responder 1` - Controla `auto-responder-groups.json` |
| **add-auto-responder** | add-auto | Adiciona resposta automática | `${PREFIX}add-auto-responder oi / olá` - Atualiza `auto-responder.json` |
| **delete-auto-responder** | del-auto | Remove resposta automática | `${PREFIX}delete-auto-responder oi` - Remove entrada |
| **list-auto-responder** | list-auto | Lista todas as respostas | `${PREFIX}list-auto-responder` - Mostra pares pergunta/resposta |
| **auto-sticker** | auto-figu, auto-stick | Auto conversão de mídia | `${PREFIX}auto-sticker 1` - Middleware `processAutoSticker` |

#### **Mensagens de Boas-vindas**
| Comando | Aliases | Função | Uso Técnico |
|---------|---------|--------|-------------|
| **welcome** | - | Ativa boas-vindas | `${PREFIX}welcome 1` - Middleware `onGroupParticipantsUpdate` |
| **exit** | - | Ativa mensagem de saída | `${PREFIX}exit 1` - Detecta participante removido |

#### **Utilitários Admin**
| Comando | Aliases | Função | Uso Técnico |
|---------|---------|--------|-------------|
| **delete** | - | Deleta mensagem (responder) | `${PREFIX}delete` - `deleteMessage(webMessage.key)` |
| **hide-tag** | ht | Marca todos sem mostrar lista | `${PREFIX}hide-tag texto` - Mentions invisíveis |
| **revelar** | - | Revela quem enviou mensagem anônima | `${PREFIX}revelar` - Mostra sender original |
| **saldo** | balance | Consulta créditos Spider X API | `${PREFIX}saldo` - Endpoint `/balance` |
| **agendar-mensagem** | - | Agenda envio futuro | `${PREFIX}agendar-mensagem` - Sistema de setTimeout |

### 👥 COMANDOS MEMBER (70+ comandos)
*Disponíveis para todos os membros*

#### **🎯 Comandos Básicos**
| Comando | Aliases | Função | Uso Técnico |
|---------|---------|--------|-------------|
| **menu** | help | Exibe menu principal | `${PREFIX}menu` - `sendImageFromFile()` + `menuMessage()` |
| **ping** | pong | Testa latência e uptime | `${PREFIX}ping` - Calcula diferença timestamp |
| **perfil** | profile | Mostra info do usuário | `${PREFIX}perfil @user` - Metadados do contato |

#### **📥 Downloads (6 comandos)**
| Comando | Aliases | Função | Uso Técnico |
|---------|---------|--------|-------------|
| **instagram** | ig, inst, insta | Download Instagram | `${PREFIX}instagram URL` - Spider X API `/instagram` |
| **tik-tok** | ttk | Download vídeos TikTok | `${PREFIX}tik-tok URL` - Spider X API `/tik-tok` |
| **yt-mp3** | - | Download áudio YouTube | `${PREFIX}yt-mp3 URL` - Extração MP3 via API |
| **yt-mp4** | - | Download vídeo YouTube | `${PREFIX}yt-mp4 URL` - Qualidade automática |
| **play-audio** | - | Busca e baixa áudio | `${PREFIX}play-audio música` - Search + download |
| **play-video** | - | Busca e baixa vídeo | `${PREFIX}play-video clipe` - Search + download |

#### **🤖 Inteligência Artificial (4 comandos)**
| Comando | Aliases | Função | Uso Técnico |
|---------|---------|--------|-------------|
| **gemini** | takeshi | Chat com Google Gemini | `${PREFIX}gemini pergunta` - API Gemini Pro |
| **gpt-5-mini** | gpt-5, gpt | Chat com GPT-5 Mini | `${PREFIX}gpt-5-mini pergunta` - API GPT-5 Mini |
| **flux** | - | Geração de imagens IA | `${PREFIX}flux descrição` - Modelo Flux.1 |
| **ia-sticker** | - | Sticker gerado por IA | `${PREFIX}ia-sticker prompt` - Sticker + IA |

#### **🎨 Edição de Imagens (9 comandos)**
| Comando | Aliases | Função | Uso Técnico |
|---------|---------|--------|-------------|
| **blur** | embaça, embaçar | Aplica desfoque | `${PREFIX}blur` (responder imagem) - FFmpeg filter |
| **gray** | - | Converte para P&B | `${PREFIX}gray` - Grayscale filter |
| **pixel** | pixel-art, px | Efeito pixelizado | `${PREFIX}pixel` - Pixelate filter |
| **inverter** | - | Inverte cores | `${PREFIX}inverter` - Color inversion |
| **espelhar** | - | Espelha horizontalmente | `${PREFIX}espelhar` - Flip horizontal |
| **contraste** | - | Aumenta contraste | `${PREFIX}contraste` - Contrast filter |
| **bolsonaro** | - | Meme do Bolsonaro | `${PREFIX}bolsonaro` - Overlay template |
| **cadeia** | - | Meme da cadeia | `${PREFIX}cadeia` - Template jail |
| **rip** | - | Lápide de meme | `${PREFIX}rip` - RIP template |

#### **😄 Diversão e Interação (8 comandos)**
| Comando | Aliases | Função | Uso Técnico |
|---------|---------|--------|-------------|
| **abracar** | abraca, abraco, abracos | Abraça usuário | `${PREFIX}abracar @user` - GIF + mentions |
| **beijar** | beija, beijo, beijos | Beija usuário | `${PREFIX}beijar @user` - GIF romântico |
| **tapa** | - | Dá tapa | `${PREFIX}tapa @user` - GIF de tapa |
| **socar** | soco | Soca usuário | `${PREFIX}socar @user` - GIF de soco |
| **matar** | mata | Mata usuário | `${PREFIX}matar @user` - GIF de morte |
| **lutar** | luta | Luta contra usuário | `${PREFIX}lutar @user` - GIF de luta |
| **jantar** | janta | Convida para jantar | `${PREFIX}jantar @user` - GIF romântico |
| **dado** | - | Rola dado virtual | `${PREFIX}dado` - Random 1-6 + sticker |

#### **🔍 Pesquisa e Consultas (3 comandos)**
| Comando | Aliases | Função | Uso Técnico |
|---------|---------|--------|-------------|
| **yt-search** | youtube-search | Pesquisa no YouTube | `${PREFIX}yt-search query` - YouTube Data API |
| **google** | g | Pesquisa no Google | `${PREFIX}google termo` - Spider X API search |
| **cep** | - | Consulta CEP brasileiro | `${PREFIX}cep 01001-001` - API dos Correios |

#### **🎭 Criação de Conteúdo**
| Comando | Aliases | Função | Uso Técnico |
|---------|---------|--------|-------------|
| **sticker** | s, fig | Cria figurinha | `${PREFIX}sticker` (responder mídia) - WebP conversion |
| **attp** | - | Figurinha de texto animado | `${PREFIX}attp texto` - Spider X API ATTP |
| **ttp** | - | Figurinha de texto estático | `${PREFIX}ttp texto` - Text-to-picture |
| **fake-chat** | fq, fake-quote, f-quote, fk | Citação falsa | `${PREFIX}fake-chat @user / texto / resposta` |

#### **🔧 Conversores**
| Comando | Aliases | Função | Uso Técnico |
|---------|---------|--------|-------------|
| **to-image** | toimg | Sticker para imagem | `${PREFIX}to-image` (responder sticker) - WebP to PNG |
| **to-mp3** | tomp3 | Vídeo para áudio | `${PREFIX}to-mp3` (responder vídeo) - FFmpeg extraction |

#### **⚙️ Configuração**
| Comando | Aliases | Função | Uso Técnico |
|---------|---------|--------|-------------|
| **rename** | - | Renomeia arquivo | `${PREFIX}rename novo-nome` - Altera fileName metadata |
| **gerar-link** | - | Gera link de convite | `${PREFIX}gerar-link` - Cria invite temporário |
| **meu-lid** | - | Obtém LID do usuário | `${PREFIX}meu-lid` - Metadata de LID |

#### **📚 Exemplos para Desenvolvedores (24 comandos)**
*Pasta `src/commands/member/exemplos/`*

| Comando | Função | Demonstra |
|---------|--------|-----------|
| **exemplos-de-mensagens** | Lista todos os exemplos | Overview completo |
| **enviar-audio-de-arquivo** | Envio de áudio local | `sendAudioFromFile()` |
| **enviar-audio-de-url** | Envio de áudio remoto | `sendAudioFromURL()` |
| **enviar-audio-de-buffer** | Envio de áudio buffer | `sendAudioFromBuffer()` |
| **enviar-imagem-de-arquivo** | Envio de imagem local | `sendImageFromFile()` |
| **enviar-imagem-de-url** | Envio de imagem remota | `sendImageFromURL()` |
| **enviar-imagem-de-buffer** | Envio de imagem buffer | `sendImageFromBuffer()` |
| **enviar-video-de-arquivo** | Envio de vídeo local | `sendVideoFromFile()` |
| **enviar-video-de-url** | Envio de vídeo remoto | `sendVideoFromURL()` |
| **enviar-video-de-buffer** | Envio de vídeo buffer | `sendVideoFromBuffer()` |
| **enviar-sticker-de-arquivo** | Envio de sticker local | `sendStickerFromFile()` |
| **enviar-sticker-de-url** | Envio de sticker remoto | `sendStickerFromURL()` |
| **enviar-sticker-de-buffer** | Envio de sticker buffer | `sendStickerFromBuffer()` |
| **enviar-gif-de-arquivo** | Envio de GIF local | `sendGifFromFile()` |
| **enviar-gif-de-url** | Envio de GIF remoto | `sendGifFromURL()` |
| **enviar-gif-de-buffer** | Envio de GIF buffer | `sendGifFromBuffer()` |
| **enviar-documento-de-arquivo** | Envio de documento local | `sendDocumentFromFile()` |
| **enviar-documento-de-url** | Envio de documento remoto | `sendDocumentFromURL()` |
| **enviar-documento-de-buffer** | Envio de documento buffer | `sendDocumentFromBuffer()` |
| **enviar-enquete** | Criação de polls | `sendPoll()` |
| **enviar-localizacao** | Envio de localização | `sendLocation()` |
| **enviar-contato** | Envio de contato | `sendContact()` |
| **enviar-reacoes** | Sistema de reações | `sendReact()`, `sendSuccessReact()` |
| **enviar-mensagem-editada** | Edição de mensagens | `sendEditedReply()` |

---

## � ESTRUTURA TÉCNICA DO PROJETO

### 🚨 src/errors/ - Sistema de Erros Customizados

O bot utiliza um sistema robusto de tratamento de erros com 3 classes específicas:

#### **InvalidParameterError.js**
```javascript
class InvalidParameterError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidParameterError";
  }
}
```

**Uso:** Parâmetros faltando ou inválidos
**Exemplo:**
```javascript
if (!args.length) {
  throw new InvalidParameterError("Você precisa fornecer um argumento!");
}
```

#### **WarningError.js**
```javascript
class WarningError extends Error {
  constructor(message) {
    super(message);
    this.name = "WarningError";
  }
}
```

**Uso:** Avisos não críticos, funcionalidade já ativa/inativa
**Exemplo:**
```javascript
if (isActiveAntiLink) {
  throw new WarningError("Anti-link já está ativo!");
}
```

#### **DangerError.js**
```javascript
class DangerError extends Error {
  constructor(message) {
    super(message);
    this.name = "DangerError";
  }
}
```

**Uso:** Erros críticos, operações perigosas, permissões
**Exemplo:**
```javascript
if (!isAdmin) {
  throw new DangerError("Apenas administradores podem usar este comando!");
}
```

### 🛡️ src/middlewares/ - Sistema de Interceptação

#### **index.js - Funções de Verificação**

**Principais funções:**

1. **verifyPrefix(prefix, groupJid)**
   - Verifica se o prefixo está correto para o grupo
   - Suporta prefixos customizados por grupo

2. **isLink(text)**
   - Detecta URLs em mensagens
   - Filtros avançados para evitar falsos positivos
   - Usado pelo anti-link

3. **isAdmin(remoteJid, userLid, socket)**
   - Verifica se usuário é admin do grupo
   - Suporta tanto admins quanto super-admins
   - Trata casos especiais (dono, bot owner)

4. **checkPermission(type, socket, userLid, remoteJid)**
   - Sistema principal de verificação de permissões
   - Tipos: "member", "admin", "owner"
   - Retorna boolean para autorizar comandos

#### **onMessagesUpsert.js - Processador Principal**

**Fluxo de processamento:**
1. **Filtragem inicial:** timestamp, developer mode
2. **Detecção de eventos:** entrada/saída de membros
3. **Verificação de mute:** deletar mensagens de usuários mutados
4. **Carregamento de funções comuns**
5. **Execução de comandos dinâmicos**

**Recursos implementados:**
- ✅ Cache automático de metadados de grupo
- ✅ Timeout randômico para evitar rate limiting
- ✅ Tratamento robusto de erros Bad MAC
- ✅ Logging detalhado em developer mode
- ✅ Sistema de mute com delete automático

#### **onGroupParticipantsUpdate.js**
- Gerencia eventos de entrada/saída de membros
- Integra com sistema de boas-vindas
- Atualiza cache de participantes

#### **messageHandler.js**
- Processa tipos específicos de mensagens
- Integra com anti-spam systems
- Trata mensagens de mídia

### 🔌 src/services/ - Serviços Externos e Processamento

#### **spider-x-api.js - Integração API Externa**

**Serviços disponíveis:**

1. **play(type, search)** - Download com busca
   ```javascript
   const audioData = await play("audio", "MC Hariel Amor");
   ```

2. **download(type, url)** - Download direto
   ```javascript
   const videoData = await download("tik-tok", "https://tiktok.com/...");
   ```

3. **gemini(text)** - IA Conversacional
   ```javascript
   const response = await gemini("Como fazer um bot?");
   ```

4. **gpt5Mini(text)** - IA Conversacional GPT-5
   ```javascript
   const response = await gpt5Mini("Explique a relatividade");
   ```

5. **imageAI(description)** - Geração de imagens IA
   ```javascript
   const imageUrl = await imageAI("Gato cyberpunk em cidade neon");
   ```

5. **attp(text) / ttp(text)** - Stickers de texto
   ```javascript
   const stickerUrl = await attp("Olá mundo!");
   ```

**Configuração automática:**
- Token configurável via comando ou config
- Fallback para configuração de runtime
- Mensagens de erro explicativas

#### **ffmpeg.js - Processamento de Mídia**

**Efeitos disponíveis:**

1. **applyBlur(inputPath, intensity)**
   ```javascript
   const outputPath = await ffmpeg.applyBlur(imagePath, "7:5");
   ```

2. **convertToGrayscale(inputPath)**
   ```javascript
   const grayImage = await ffmpeg.convertToGrayscale(imagePath);
   ```

3. **mirrorImage(inputPath)**
   ```javascript
   const mirroredImage = await ffmpeg.mirrorImage(imagePath);
   ```

4. **adjustContrast(inputPath, contrast)**
   ```javascript
   const contrastImage = await ffmpeg.adjustContrast(imagePath, 1.5);
   ```

5. **applyPixelation(inputPath)**
   ```javascript
   const pixelImage = await ffmpeg.applyPixelation(imagePath);
   ```

**Características:**
- ✅ Paths temporários únicos
- ✅ Cleanup automático
- ✅ Error handling robusto
- ✅ Execução assíncrona

#### **sticker.js - Processamento de Figurinhas**

**Funções principais:**

1. **addStickerMetadata(media, metadata)**
   - Adiciona metadados EXIF
   - Pack info customizável
   - Suporte a emojis

2. **processStaticSticker(inputPath, metadata)**
   - Converte para WebP estático
   - Redimensiona para 512x512
   - Otimização de qualidade

3. **processAnimatedSticker(inputPath, metadata)**
   - Suporte a GIFs animados
   - Limite de 8 segundos
   - 15 FPS para otimização

**Especificações técnicas:**
- Formato: WebP (estático/animado)
- Resolução: 512x512 pixels
- Qualidade: 75-90 (otimizada)
- Metadados: Pack name, publisher, emojis

#### **baileys.js - Funções WhatsApp**

**getProfileImageData(socket, userLid)**
- Obtém foto de perfil do usuário
- Fallback para imagem padrão
- Salva em arquivo temporário
- Retorna buffer e path

**Tratamento de erros:**
- Foto privada/inexistente
- Problemas de conexão
- Fallback gracioso

#### **upload.js - Upload de Imagens**

**upload(imageBuffer, filename)**
- API: FreeImage.Host
- Entrada: Buffer + filename
- Saída: URL pública da imagem
- Error handling completo

### 🖥️ SUPORTE PARA HOSTS (Pterodactyl/Similar)

#### **🦕 Configuração em Pterodactyl Panel**

**1. Preparação do Ambiente**
```bash
# Startup Command
cd /home/container && npm start

# Variables
NODE_VERSION=22
NPM_VERSION=latest
```

**2. Dockerfile recomendado**
```dockerfile
FROM node:22-alpine

# Instalar dependências do sistema
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    make \
    g++ \
    git

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
CMD ["npm", "start"]
```

**3. Configurações específicas**

**Port Allocation:**
- WhatsApp Bot: Não precisa de porta HTTP
- Se usar express: Configure PORT env variable

**File Permissions:**
```bash
chmod +x reset-qr-auth.sh
chmod +x update.sh
chown -R node:node /app
```

**Environment Variables:**
```env
NODE_ENV=production
SPIDER_API_TOKEN=seu_token_aqui
DEVELOPER_MODE=false
```

#### **📦 Wings/Nest Specific**

**1. Startup Process**
```json
{
  "startup": "npm start",
  "stop": "pkill -f 'node.*takeshi'",
  "configs": {
    "files": "package.json",
    "startup": {
      "done": "Bot conectado com sucesso!"
    }
  }
}
```

**2. File Management**
- **Persistent:** `database/`, `assets/auth/`
- **Temporary:** `assets/temp/` (pode ser tmpfs)
- **Static:** `assets/images/`, `assets/stickers/`

**3. Resource Requirements**
```yaml
cpu: 1000m      # 1 vCPU
memory: 512Mi   # 512MB RAM  
storage: 2Gi    # 2GB disk
```

#### **🐳 Docker Compose Setup**

```yaml
version: '3.8'
services:
  takeshi-bot:
    build: .
    container_name: takeshi-bot
    restart: unless-stopped
    volumes:
      - ./database:/app/database
      - ./assets/auth:/app/assets/auth
      - ./assets/temp:/app/assets/temp
    environment:
      - NODE_ENV=production
      - SPIDER_API_TOKEN=${SPIDER_API_TOKEN}
    networks:
      - bot-network

networks:
  bot-network:
    driver: bridge
```

#### **⚙️ Troubleshooting Hosts**

**1. Problemas Comuns em Hosting**

**❌ "Permission Denied" em scripts**
```bash
# Solução
chmod +x *.sh
```

**❌ "FFmpeg not found"**
```bash
# Pterodactyl Dockerfile
RUN apk add --no-cache ffmpeg

# Ubuntu/Debian
apt-get update && apt-get install -y ffmpeg
```

**❌ "Port already in use"**
```bash
# Verificar processos
ps aux | grep node
pkill -f "node.*takeshi"
```

**2. Otimizações para VPS**

**Memory Management:**
```javascript
// Adicionar ao código se necessário
if (process.memoryUsage().heapUsed > 400 * 1024 * 1024) {
  console.log('High memory usage, triggering GC');
  global.gc && global.gc();
}
```

**Process Monitoring:**
```bash
# PM2 para produção
npm install -g pm2
pm2 start index.js --name takeshi-bot
pm2 startup
pm2 save
```

**3. Backup Automatizado**

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf "backup_${DATE}.tar.gz" database/ assets/auth/
echo "Backup criado: backup_${DATE}.tar.gz"
```

#### **📊 Monitoramento em Produção**

**1. Health Checks**
```javascript
// health-check.js
import fs from 'node:fs';
const logFile = 'assets/temp/wa-logs.txt';

if (fs.existsSync(logFile)) {
  const stats = fs.statSync(logFile);
  const lastModified = new Date(stats.mtime);
  const now = new Date();
  
  if (now - lastModified > 300000) { // 5 minutos
    console.error('Bot pode estar inativo!');
    process.exit(1);
  }
}
```

**2. Alertas via Webhook**
```javascript
// alerts.js
import axios from 'axios';

const sendAlert = async (message) => {
  await axios.post('YOUR_WEBHOOK_URL', {
    content: `🚨 Takeshi Bot Alert: ${message}`
  });
};
```

**3. Métricas importantes**
- CPU Usage: < 50%
- Memory: < 80% do limite
- Disk Space: < 70%
- Log file growth: Monitorar tamanho
- API Response time: < 3s

---

## �🔧 TROUBLESHOOTING E SUPORTE TÉCNICO

### 🚨 Problemas Comuns

#### **1. Erros de Conexão**
```
❌ "Connection Closed"
❌ "Bad MAC"
❌ "Session Invalid"
```

**Soluções:**
1. Execute `bash reset-qr-auth.sh`
2. Remova dispositivo no WhatsApp Web
3. Execute `npm start` e reconecte
4. Verifique `src/utils/badMacHandler.js` para handling automático

#### **2. Comandos Não Respondem**
```
❌ Bot não executa comandos
❌ Permissões negadas
```

**Verificações:**
1. Confirme prefixo: `getPrefix(remoteJid)` em `src/utils/database.js`
2. Verifique grupo ativo: `isActiveGroup()` 
3. Confirme permissões: pasta correta (owner/admin/member)
4. Check mute status: `checkIfMemberIsMuted()`

#### **3. Erros de API Externa**
```
❌ Spider X API falha
❌ Downloads não funcionam
❌ IA não responde
```

**Diagnóstico:**
1. Teste token: `${PREFIX}saldo`
2. Verifique `src/services/spider-x-api.js`
3. Confirme `SPIDER_API_TOKEN` em config
4. Check rate limits da API

#### **4. Problemas de Mídia**
```
❌ Stickers não geram
❌ Conversões falham
❌ Downloads corrompidos
```

**Soluções:**
1. Verifique FFmpeg: `ffmpeg -version`
2. Check `src/services/ffmpeg.js`
3. Confirme permissions em `assets/temp/`
4. Validate file sizes e formatos

### 🛠️ Debugging Avançado

#### **1. Ativando Logs Detalhados**
```javascript
// src/config.js
export const DEVELOPER_MODE = true;
```

**Logs salvos em:** `assets/temp/wa-logs.txt`

#### **2. Monitorando Mensagens**
```javascript
// src/middlewares/onMessagesUpsert.js
// Todas as mensagens são logadas em developer mode
```

#### **3. Verificando Estado do Database**
```javascript
// Exemplo de debug
import { isActiveGroup, getPrefix } from './utils/database';
console.log('Grupo ativo:', isActiveGroup(remoteJid));
console.log('Prefixo:', getPrefix(remoteJid));
```

#### **4. Testing Comandos Isoladamente**
```javascript
// src/test.js - Execute com npm test
// Testa funções individuais sem WhatsApp
```

### 📋 Checklist de Saúde do Bot

**Daily Health Check:**
- [ ] Bot conectado (sem "Connection Closed")
- [ ] Comandos básicos respondem (`${PREFIX}ping`)
- [ ] APIs externas funcionais (`${PREFIX}saldo`)
- [ ] Logs sem erros críticos
- [ ] Cache de grupos atualizado

**Weekly Maintenance:**
- [ ] Limpar `assets/temp/` de arquivos antigos
- [ ] Verificar `assets/temp/wa-logs.txt` por padrões de erro
- [ ] Update dependências: `npm update`
- [ ] Backup de `database/` (configurações)
- [ ] Test comandos de cada categoria

**Monthly Tasks:**
- [ ] Executar `bash update.sh` para últimas features
- [ ] Revisar `database/muted.json` e limpar inativos
- [ ] Verificar espaço em disco (`assets/temp/`)
- [ ] Documentar novos comandos adicionados
- [ ] Performance review (memory leaks, etc)

### 📖 Guias Específicos por Categoria

#### **🔐 COMANDOS OWNER - Guia Técnico**

**Casos de Uso:**
- Configuração inicial do bot
- Manutenção e debugging
- Personalização avançada

**Comandos Críticos:**
2. **set-spider-api-token** - Necessário para IA e downloads
3. **exec** - Use com EXTREMA cautela (proteções implementadas)

**Boas Práticas:**
- Mantenha token Spider X API atualizado
- Use `exec` apenas para debugging/manutenção
- Teste `get-group-id` para obter JIDs corretos

#### **👮 COMANDOS ADMIN - Guia de Moderação**

**Workflow de Moderação:**
1. Configure anti-spams: `anti-link 1`, `anti-audio 1`, etc
2. Ative boas-vindas: `welcome 1`
3. Configure auto-responder se necessário
4. Use `mute`/`ban` para problemas

**Comandos por Prioridade:**
- **Alta:** `ban`, `mute`, `anti-link`
- **Média:** `promover`, `rebaixar`, `welcome`
- **Baixa:** `auto-responder`, `hide-tag`

**Troubleshooting Admin:**
- Se comandos falham: verifique permissões admin do bot
- Para ban/kick: bot precisa ser admin
- Auto-responder: ative o sistema + adicione termos
- Anti-spam: funciona por middleware, não por comando

#### **👥 COMANDOS MEMBER - Guia de Funcionalidades**

**Por Categoria de Uso:**

**Downloads (`/downloads`):**
- **instagram**: Download de Reels e posts
- **tik-tok**: URL completa necessária
- **yt-mp3/mp4**: Suporta URLs e search
- **play-audio/video**: Busca automática + download

**IA (`/ia`):**
- **gemini**: Conversação natural
- **gpt-5-mini**: IA de última geração
- **flux**: Descrição detalhada = melhor resultado
- **ia-sticker**: Combina prompt + sticker

**Canvas (`/canvas`):**
- Todos precisam de imagem como resposta/menção
- Processamento via FFmpeg
- Outputs em PNG/JPG

**Funny (`/funny`):**
- Todos precisam menção de usuário
- GIFs pré-configurados em `assets/`
- Mentions automáticas

**Search (`/search`):**
- **cep**: Formato brasileiro padrão
- **google**: Via Spider X API
- **yt-search**: Retorna links para `play-*`

### 🔬 Análise de Performance

#### **Métricas Importantes:**
1. **Tempo de resposta médio:** < 2 segundos
2. **Uso de memória:** Monitorar `process.memoryUsage()`
3. **Rate limiting:** Spider X API = 1000 requests/dia
4. **Uptime:** Target 99%+ 

#### **Otimizações Implementadas:**
- Cache de grupos (24h TTL)
- Cleanup automático de arquivos temp
- Rate limiting por timeout (700ms)
- Connection auto-recovery (badMacHandler)

#### **Monitoramento:**
```javascript
// Adicione ao seu código para monitorar
console.log('Memory:', process.memoryUsage());
console.log('Uptime:', process.uptime());
```

---

## 🎯 RESUMO PARA IA

### Comandos mais importantes para assistir usuários:

**Criação de comando:**
```javascript
// Arquivo: src/commands/member/meu-comando.js
import { PREFIX } from "../../config.js";
import { InvalidParameterError } from `../../errors`;

export default {
  name: "meu-comando",
  description: "Faz algo legal",
  commands: ["meu-comando", "mc"],
  usage: `${PREFIX}meu-comando <argumento>`,
  /**
   * @param {CommandHandleProps} props
   */
  handle: async ({ sendReply, args, sendSuccessReact, sendErrorReply }) => {
    if (!args.length) {
      throw new InvalidParameterError("Argumento obrigatório!");
    }
    
    await sendSuccessReact();
    await sendReply("Funcionou! Args: " + args.join(", "));
  },
};
```

**Estrutura de CommandHandleProps (src/@types/index.d.ts):**
- `args: string[]` - Argumentos separados por `/` ou `|`
- `fullArgs: string` - String completa dos argumentos
- `isImage/isVideo/isAudio/isSticker: boolean` - Detectores de mídia
- `sendReply/sendSuccessReply/sendErrorReply/sendWarningReply` - Respostas
- `sendImageFromFile/FromURL/FromBuffer` - Envio de mídia
- `getGroupMetadata/Name/Owner/Participants/Admins` - Dados do grupo
- `socket` - Baileys socket para operações avançadas

**Debugging:**
- Logs: `assets/temp/wa-logs.txt`
- Ativar: `DEVELOPER_MODE = true` em `src/config.js`
- Testes: `npm test` executa `src/test.js`

**Estrutura de permissões:**
- `src/commands/owner/` - 8 comandos (exec, set-*, get-group-id, on/off)
- `src/commands/admin/` - 30+ comandos (anti-*, ban, promote, auto-responder)
- `src/commands/member/` - 70+ comandos organizados em subpastas:
  - `downloads/` - TikTok, YouTube, Play
  - `ia/` - Gemini, Flux, IA-Sticker
  - `canvas/` - Blur, Pixel, Gray, etc
  - `funny/` - Abracar, Tapa, Dado, etc
  - `search/` - CEP, Google, YouTube Search
  - `exemplos/` - 24 exemplos para desenvolvedores

**Nunca faça:**
- ❌ Ler database JSON diretamente
- ❌ Verificar permissões manualmente
- ❌ Usar `require()` absoluto em comandos
- ❌ Ignorar `CommandHandleProps` typing
- ❌ Misturar responsabilidades em um comando

**Sempre faça:**
- ✅ Use funções de `utils/database.js`: `getPrefix()`
- ✅ Consulte `@types/index.d.ts` para API completa
- ✅ Teste no Node.js 22+
- ✅ Use error classes: `InvalidParameterError`, `WarningError`, `DangerError`
- ✅ Implemente cleanup de arquivos temporários
- ✅ Documente funções complexas

**Padrões de código:**
- Imports no topo: config, errors, utils
- Destructuring completo das props
- Validação de parâmetros primeiro
- Reações para feedback (`sendWaitReact`, `sendSuccessReact`)
- Try/catch para APIs externas
- Cleanup de recursos (arquivos, connections)

---

### 📁 ARQUIVOS PRINCIPAIS DO SISTEMA

#### **🔗 src/connection.js - Gerenciador de Conexão WhatsApp**

**Responsabilidades:**
- Conexão e reconexão automática com WhatsApp
- Gerenciamento de estados de autenticação
- Cache de metadados de grupos (24h TTL)
- Handling robusto de erros "Bad MAC"
- Pareamento por código QR/PIN

**Principais funções:**

1. **connect()**
   ```javascript
   const socket = makeWASocket({
     version: [2, 3000, 1029037448],
     auth: { creds, keys: makeCacheableSignalKeyStore() },
     cachedGroupMetadata: (jid) => groupCache.get(jid),
     maxMsgRetryCount: 5,
     keepAliveIntervalMs: 30_000
   });
   ```

2. **updateGroupMetadataCache(jid, metadata)**
   - Cache NodeCache com TTL de 24 horas
   - Reduz chamadas à API do WhatsApp
   - Melhora performance drasticamente

**Estados de conexão tratados:**
- **connection.close** → Reconexão automática
- **DisconnectReason.loggedOut** → Requer novo pareamento
- **DisconnectReason.badSession** → Clear cache + reconnect
- **DisconnectReason.restartRequired** → Manual restart needed

**Bad MAC Error Handling:**
- Limite: 15 tentativas automáticas
- Auto-clear de arquivos de sessão problemáticos
- Reset automático do counter após sucesso

**Configurações de performance:**
- `connectTimeoutMs: 20_000` - Timeout de conexão
- `retryRequestDelayMs: 5000` - Delay entre tentativas
- `syncFullHistory: false` - Não sincroniza histórico completo
- `shouldSyncHistoryMessage: () => false` - Otimização de memória

#### **⚙️ src/config.js - Configurações Centralizadas**

**Configurações de Proxy (opcional):**
- `PROXY_PROTOCOL`, `PROXY_HOST`, `PROXY_PORT`
- `PROXY_USERNAME`, `PROXY_PASSWORD`

**Overrides via Database:**
- Prefixo: `database/prefix-groups.json`
- Token API: `database/config.json`
- Números: Runtime via comandos set-*

#### **🚀 src/loader.js - Carregador de Eventos**

**Função principal: load(socket)**

**Responsabilidades:**
1. **Registra event listeners** do Baileys
2. **Implementa timeout anti-ban** (TIMEOUT_IN_MILLISECONDS_BY_EVENT)
3. **Error handling global** com badMacHandler

**Event Listeners registrados:**

```javascript
socket.ev.on("messages.upsert", async (data) => {
  setTimeout(() => {
    safeEventHandler(() => onMessagesUpsert({
      socket,
      messages: data.messages,
      startProcess: Date.now()
    }));
  }, TIMEOUT_IN_MILLISECONDS_BY_EVENT);
});
```

**SafeEventHandler pattern:**
- Try/catch wrapper para todos os eventos
- BadMacHandler integration
- Stack trace logging para debugging

**Process-level error handling:**
- `uncaughtException` → BadMacHandler ou log + exit
- `unhandledRejection` → BadMacHandler ou log

#### **📋 src/menu.js - Gerador de Menu Dinâmico**

**Função: menuMessage(groupJid)**

**Features:**
- **Prefixo dinâmico** via `getPrefix(groupJid)`
- **Data/hora atual** formatada para pt-BR
- **Versão do bot** via package.json
- **Categorização** por permissões (DONO/ADMINS/PRINCIPAL/etc)

**Estrutura do menu:**
```javascript
return `╭━━⪩ BEM VINDO! ⪨━━${readMore()}
▢ • ${BOT_NAME}
▢ • Prefixo: ${prefix}
▢ • Versão: ${packageInfo.version}
╰━━─「🪐」─━━

╭━━⪩ DONO ⪨━━
▢ • ${prefix}exec
▢ • ${prefix}set-*
╰━━─「🌌」─━━`;
```

**readMore() function:**
- Adiciona 950 caracteres invisíveis (\u200B)
- Força "Ler mais..." no WhatsApp
- Melhora UX em menus longos

#### **💬 src/messages.js - Templates de Mensagens**

**Mensagens configuráveis:**

```javascript
export default {
  welcomeMessage: "Seja bem vindo ao nosso grupo, @member!",
  exitMessage: "Poxa, @member saiu do grupo... Sentiremos sua falta!",
};
```

**Placeholder @member:**
- Automaticamente substituído por menção ao usuário
- Usado em `onGroupParticipantsUpdate.js`
- Suporte a formatação customizada

#### **🧪 src/test.js - Ambiente de Testes**

**Propósito:**
- Testes isolados de funções utilitárias
- Não requer conexão WhatsApp
- Usado com `npm test`

**Exemplo de uso:**
```javascript
(async () => {
  // Teste de funções específicas
  import { isLink } from './middlewares';
  console.log(isLink('https://google.com')); // true
  
  // Teste de database functions
  import { getPrefix } from './utils/database';
  console.log(getPrefix('grupo@g.us')); // "/" ou customizado
})();
```

#### **🎬 src/index.js - Ponto de Entrada Principal**

**Função: startBot()**

**Fluxo de inicialização:**
1. **Configurações de ambiente**
   ```javascript
   process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
   process.setMaxListeners(1500);
   ```

2. **BadMacHandler stats** iniciais
3. **Conexão** via `connect()`
4. **Load de eventos** via `load(socket)`
5. **Health monitoring** a cada 5 minutos

**Error handling robusto:**
- `uncaughtException` → BadMacHandler ou exit(1)
- `unhandledRejection` → BadMacHandler ou log
- Startup errors → Retry após 5s ou exit

**Comentários educativos:**
- Explica diferença entre "cases" e "comandos modulares"
- Guia completo para iniciantes
- Links para tutorial detalhado

#### **🛠️ src/utils/index.js - Funções Utilitárias Principais**

**Principais funções organizadas por categoria:**

**1. Processamento de Mensagens:**

```javascript
extractDataFromMessage(webMessage) // Extrai args, comando, prefix, etc
splitByCharacters(str, ["/", "|", "\\"]) // Split por múltiplos chars
formatCommand(text) // Normaliza comando (lowercase, sem acentos)
```

**2. Detecção de Tipos de Mídia:**

```javascript
baileysIs(webMessage, "image") // Verifica se é imagem
getContent(webMessage, "video") // Obtém conteúdo de vídeo
download(webMessage, fileName, "audio", "mp3") // Download de mídia
```

**3. Comandos Dinâmicos:**

```javascript
findCommandImport(commandName) // Busca comando nos diretórios
readCommandImports() // Carrega todos os comandos {admin,member,owner}
```

**4. Processamento de Mídia:**

```javascript
getBuffer(url, options) // Download via axios
ajustAudioByBuffer(buffer, isPtt) // Converte áudio via FFmpeg
removeFileWithTimeout(path, 5000) // Cleanup automático
```

**5. Utilitários Diversos:**

```javascript
isAtLeastMinutesInPast(timestamp, 5) // Filtro de mensagens antigas
getRandomNumber(min, max) // RNG
getRandomName(extension) // Nome de arquivo único
readMore() // Caracteres invisíveis para "Ler mais"
question(message) // Input readline
```

#### **⚡ src/utils/dynamicCommand.js - Router de Comandos**

**Responsabilidades principais:**

1. **Validação de Prefixo e Comando**
   ```javascript
   if (!verifyPrefix(prefix, remoteJid) || !hasTypeAndCommand({ type, command })) {
     // Auto-responder ou resposta de prefixo
   }
   ```

2. **Sistema Anti-Link**
   - Detecta links em mensagens via `isLink(fullMessage)`
   - Remove automaticamente usuários não-admin
   - Deleta mensagem com link

3. **Verificação de Permissões**
   ```javascript
   if (!(await checkPermission({ type, ...paramsHandler }))) {
     // Bloqueia comando baseado na pasta (owner/admin/member)
   }
   ```

4. **Modo Only-Admins**
   - Verifica se grupo tem restrição de admin
   - Bloqueia comandos para membros comuns

5. **Error Handling Robusto**
   - **InvalidParameterError** → Parâmetros inválidos
   - **WarningError** → Avisos amarelos
   - **DangerError** → Erros vermelhos
   - **AxiosError** → Erros de API externa
   - **BadMacError** → Problemas de sessão

6. **Comando Especial: Grupo Inativo**
   - Permite apenas comando `on` em grupos desativados
   - Bloqueia demais comandos até reativação

**Fluxo de execução:**
```javascript
Anti-Link Check → Permission Check → Only-Admin Check → 
Command Execution → Error Handling → Response
```

#### **🔗 src/utils/loadCommonFunctions.js - Factory de Funções**

**Função principal: loadCommonFunctions({ socket, webMessage })**

**Retorna objeto com 60+ funções organizadas:**

**1. Estados de Presença:**
```javascript
sendTypingState(anotherJid) // "digitando..."
sendRecordState(anotherJid) // "gravando áudio..."
```

**2. Sistema de Retry:**
```javascript
withRetry(fn, maxRetries = 3, delayMs = 1000) // Retry automático
```

**3. Downloads de Mídia:**
```javascript
downloadAudio(webMessage, fileName) // → .mpeg
downloadImage(webMessage, fileName) // → .png
downloadSticker(webMessage, fileName) // → .webp
downloadVideo(webMessage, fileName) // → .mp4
```

**4. Funções de Envio (26 variações):**

**Texto:**
```javascript
sendText(text, mentions) // Texto simples
sendReply(text, mentions) // Resposta quotada
sendEditedText/Reply(text, messageToEdit, mentions) // Editar mensagem
```

**Reações e Respostas Estilizadas:**
```javascript
sendReact(emoji, msgKey) // Reação customizada
sendSuccessReact/Reply() // ✅ Verde
sendWaitReact/Reply() // ⏳ Aguarde
sendWarningReact/Reply() // ⚠️ Amarelo
sendErrorReact/Reply() // ❌ Vermelho
```

**Mídia (File/URL/Buffer):**
```javascript
// Áudio
sendAudioFromFile(filePath, asVoice, quoted)
sendAudioFromURL(url, asVoice, quoted)
sendAudioFromBuffer(buffer, asVoice, quoted)

// Imagem
sendImageFromFile(file, caption, mentions, quoted)
sendImageFromURL(url, caption, mentions, quoted)
sendImageFromBuffer(buffer, caption, mentions, quoted)

// Vídeo, GIF, Documento, Sticker (mesmo padrão)
```

**5. Comunicação Avançada:**
```javascript
sendContact(phoneNumber, displayName) // Contato vCard
sendLocation(latitude, longitude) // Localização
sendPoll(title, options, singleChoice) // Enquete
deleteMessage(key) // Deletar mensagem
```

**6. Funções de Grupo:**
```javascript
getGroupMetadata(jid) // Metadados completos
getGroupName(jid) // Nome do grupo
getGroupOwner(jid) // Dono do grupo
getGroupParticipants(jid) // Lista de participantes
getGroupAdmins(jid) // Lista de administradores
```

**Características especiais:**
- **withRetry pattern** para operações instáveis
- **Processamento de áudio** via FFmpeg automático
- **Cleanup automático** de arquivos temporários
- **Validação de tipos** (isGroup, isGroupWithLid)

#### **🌐 src/utils/proxy.js - Configuração de Proxy**

**Função: getProxyData()**

**Retorna:**
```javascript
{
  proxy: {
    protocol: "http", // ou "https", "socks5"
    host: "proxy.exemplo.com",
    port: 8080,
    auth: {
      username: "usuario_encoded",
      password: "senha_encoded"
    }
  },
  proxyConnectionString: "http://user:pass@proxy.exemplo.com:8080"
}
```

**Uso:**
- Configuração opcional para conexões via proxy
- Encoding automático de credenciais
- Compatible com Axios e outras libs HTTP

### 🧪 PASTA src/test - SISTEMA DE TESTES

#### **🔍 src/test/isLink.test.js - Testes do Anti-Link**

**Responsabilidades:**
- Testa função `isLink()` do middleware
- **37 casos de teste** abrangentes
- Cobertura completa de edge cases

**Categorias de teste:**

**1. Links Válidos (should return true):**
```javascript
"site com espaços.com"     // Domínio com espaços
"site-legal.com"           // Domínio com hífen
"site.com.br"              // Múltiplas extensões
"www.google.com"           // Com www
"ab.xyz"                   // Domínio curto válido
"site123.com"              // Termina com número
"123site.com"              // Começa com número
"200.155.65.12"            // Endereço IP
"subdomain.example.org"    // Subdomínio
"https://github.com/user/repo" // URL completa
"Acesse google.com para buscar" // Texto com URL
"  google.com  "           // URL com espaços nas bordas
"GOOGLE.COM"               // URL em maiúscula
```

**2. Texto Normal (should return false):**
```javascript
"arquivo.txt"              // Arquivo local
"documento.pdf"            // Arquivo PDF
"   "                      // Apenas espaços
"12345"                    // Apenas números
".com"                     // Começa com ponto
"a.b"                      // Domínio muito curto
"email@domain"             // E-mail sem extensão
"versão 1.0.5"             // Número de versão
"site..com"                // Pontos consecutivos
""                         // String vazia
"site."                    // Termina com ponto
"apenas texto"             // Texto normal
```

**Execução dos testes:**
```bash
npm test                   # Executa todos os testes
npm run test:all          # Node.js test runner
node src/test.js          # Teste manual
```

**Estrutura do teste:**
```javascript
describe("isLink Middleware", () => {
  const testCases = [
    {
      input: "google.com",
      expected: true,
      description: "Domínio simples"
    }
  ];

  testCases.forEach(({ input, expected, description }) => {
    it(description, () => {
      const result = isLink(input);
      assert.strictEqual(result, expected, 
        `Para entrada "${input}", esperado ${expected} mas recebeu ${result}`
      );
    });
  });
});
```

**Validação rigorosa:**
- Testa edge cases reais encontrados em produção
- Previne falsos positivos (arquivo.txt não é link)
- Previne falsos negativos (google.com é link)
- Cobertura de URLs com parâmetros, paths, protocolos

### 🎯 PRINCIPAIS UTILIDADES DOCUMENTADAS

#### **📝 src/utils/logger.js - Sistema de Logs**

**Funções de logging:**

```javascript
bannerLog() // ASCII art de inicialização
successLog(message) // ✅ Verde
errorLog(message) // ❌ Vermelho
warningLog(message) // ⚠️ Amarelo
infoLog(message) // ℹ️ Azul
sayLog(message) // 💬 Cyan
```

**Configuração:**
- Output: Console + arquivo `assets/temp/wa-logs.txt`
- Timestamp automático
- Cores para fácil identificação

#### **🗄️ src/utils/database.js - Gerenciador de Database JSON**

**Principais funções por categoria:**

**Configurações:**
```javascript
getPrefix(groupJid) // Prefixo personalizado ou padrão
setGroupPrefix(groupJid, prefix) // Define prefixo do grupo
getSpiderApiToken() / setSpiderApiToken(token) // Token da API
```

**Grupos:**
```javascript
activateGroup(jid) / deactivateGroup(jid) // Liga/desliga bot
isActiveGroup(jid) // Verifica se bot está ativo
```

**Anti-spam systems:**
```javascript
isActiveAntiLinkGroup(jid) // Anti-link ativo?
activateAntiLinkGroup(jid) / deactivateAntiLinkGroup(jid)
// Similar para: AntiAudio, AntiDocument, AntiImage, etc
```

**Mute system:**
```javascript
muteMember(groupJid, userJid) // Adiciona a lista de muted
unmuteMember(groupJid, userJid) // Remove da lista
checkIfMemberIsMuted(groupJid, userJid) // Verifica status
```

**Auto-responder:**
```javascript
getAutoResponderResponse(text) // Busca resposta para texto
addAutoResponderItem(match, answer) // Adiciona termo
deleteAutoResponderItem(index) // Remove termo
getAutoResponderList() // Lista todos os termos
```

**Padrão de uso:**
- Todos os JSONs em `database/`
- Read → Modify → Write pattern
- Error handling para arquivos corrompidos/inexistentes

#### **⚠️ src/utils/badMacHandler.js - Gerenciador de Erros Bad MAC**

**Funcionalidades:**

1. **Error tracking**
   ```javascript
   handleError(error, context) // Processa erro e incrementa counter
   isSessionError(error) // Detecta erros de sessão
   hasReachedLimit() // Verifica se atingiu máximo (15)
   ```

2. **Session management**
   ```javascript
   clearProblematicSessionFiles() // Remove pasta baileys/
   resetErrorCount() // Zera contador
   getStats() // { errorCount, maxRetries, lastError }
   ```

3. **Detecção inteligente**
   - Strings: "Bad MAC", "Connection Closed"
   - Contexts: "connection.update", "message-processing"
   - Timeout entre tentativas

### 🔍 ARQUIVOS DE TIPO (TypeScript Definitions)

#### **📘 src/@types/index.d.ts - Definições TypeScript**

**Interface CommandHandleProps:**

**Propriedades básicas:**
```typescript
args: string[]           // ["arg1", "arg2"] - split por / | \
commandName: string      // Nome do comando executado
fullArgs: string         // "arg1 / arg2" - string completa
fullMessage: string      // Mensagem inteira incluindo comando
prefix: string           // Prefixo configurado
remoteJid: string        // ID do grupo/usuário
userLid: string          // ID do usuário que mandou
```

**Detectores de tipo:**
```typescript
isAudio: boolean         // Se é mensagem de áudio
isGroup: boolean         // Se veio de um grupo
isImage: boolean         // Se é imagem
isReply: boolean         // Se é resposta a outra mensagem
isSticker: boolean       // Se é figurinha
isVideo: boolean         // Se é vídeo
isGroupWithLid: boolean  // Se grupo tem participantes com LID
```

**Reply handling:**
```typescript
replyLid: string         // ID de quem foi respondido
replyText: string        // Texto da mensagem respondida
```

**Funções de envio de mídia (26 variações):**
```typescript
// Áudio
sendAudioFromFile(path: string, asVoice: boolean, quoted?: boolean)
sendAudioFromURL(url: string, asVoice: boolean, quoted?: boolean)
sendAudioFromBuffer(buffer: Buffer, asVoice: boolean, quoted?: boolean)

// Imagem (3 variações similares)
sendImageFromFile/URL/Buffer(source, caption?, mentions?, quoted?)

// Vídeo (3 variações similares)
sendVideoFromFile/URL/Buffer(source, caption?, mentions?, quoted?)

// Sticker (3 variações similares)
sendStickerFromFile/URL/Buffer(source, quoted?)

// GIF (3 variações similares)
sendGifFromFile/URL/Buffer(source, caption?, mentions?, quoted?)

// Documento (3 variações similares)
sendDocumentFromFile/URL/Buffer(source, mimetype?, fileName?, quoted?)
```

**Funções de resposta:**
```typescript
sendReply(text: string, mentions?: string[]) // Resposta básica
sendSuccessReply(text: string, mentions?: string[]) // ✅ Verde
sendErrorReply(text: string, mentions?: string[]) // ❌ Vermelho
sendWarningReply(text: string, mentions?: string[]) // ⚠️ Amarelo
sendWaitReply(text: string, mentions?: string[]) // ⏳ Aguarde

sendText(text: string, mentions?: string[]) // Texto simples
sendEditedText/Reply() // Mensagens editadas
```

**Funções de reação:**
```typescript
sendReact(emoji: string) // Reação customizada
sendSuccessReact() // ✅
sendErrorReact() // ❌
sendWarningReact() // ⚠️
sendWaitReact() // ⏳
```

**Estados de digitação:**
```typescript
sendTypingState(anotherJid?: string) // Mostra "digitando..."
sendRecordState(anotherJid?: string) // Mostra "gravando áudio"
```

**Downloads de mídia:**
```typescript
downloadAudio(webMessage, fileName: string): Promise<string>
downloadImage(webMessage, fileName: string): Promise<string>
downloadSticker(webMessage, fileName: string): Promise<string>
downloadVideo(webMessage, fileName: string): Promise<string>
```

**Funções de grupo:**
```typescript
getGroupMetadata(lid?: string): Promise<GroupMetadata | null>
getGroupName(lid?: string): Promise<string>
getGroupOwner(lid?: string): Promise<string>
getGroupParticipants(lid?: string): Promise<any[]>
getGroupAdmins(lid?: string): Promise<string[]>
```

**Comunicação avançada:**
```typescript
sendContact(phoneNumber: string, displayName: string): Promise<void>
sendLocation(latitude: number, longitude: number): Promise<void>
sendPoll(title: string, options: {optionName: string}[], singleChoice?: boolean)
deleteMessage(key: MessageKey): Promise<void>
```

**Socket Baileys:**
```typescript
socket: any // Socket completo do Baileys para operações avançadas
webMessage: any // Mensagem raw do WhatsApp
startProcess?: number // Timestamp de quando comando iniciou
type?: string // Tipo de comando ("admin", "owner", "member")
```

---

**Estrutura técnica:** src/errors, src/middlewares, src/services incluídas  
**Suporte a hosts:** Pterodactyl, Docker, VPS configurado  
**Documentação completa:** src/test, src/utils, arquivos principais  
**Maintainer:** Dev Gui ([@devgui_](https://youtube.com/@devgui_))

---
# Pterodactyl

Este é um documento de suporte completo e passo a passo em Markdown para guiar os clientes sobre como operar as funcionalidades essenciais do **Painel Pterodactyl**.

O **Pterodactyl** é um painel de gerenciamento de servidores amplamente utilizado no setor de hospedagem.

Aqui estão os detalhes sobre o que ele é e como é utilizado, de acordo com as fontes:

### Definição e Popularidade

*   O painel é conhecido por diferentes nomes, incluindo **"piteiro"** ou **"Pterodáctilo"**.
*   É **extremamente popular** na indústria de hospedagem. Estima-se que **95% das empresas de hospedagem** utilizam este painel, especialmente aquelas que trabalham com Minecraft.
*   É referido como um **"maravilhoso painel"**.
*   O Pterodactyl usa uma **Framework** e requer a instalação de dependências como PHP, Nginx, e MySQL.

### Aparência e Uso

*   O Pterodactyl segue um **mesmo visual** e estrutura, sendo que **a única coisa que geralmente muda são as cores**, o que significa que os painéis são semelhantes.
*   Ele é usado para gerenciar e configurar servidores de jogos, como Minecraft e FiveM (GTA V Multiplayer), mas também pode ser configurado para rodar bots e APIs.
*   Ao acessá-lo, o painel exibe informações cruciais sobre o desempenho e o status do servidor, incluindo:
    *   Nome e IP do servidor.
    *   **CPU** (quanto o servidor está puxando em tempo real e o limite que pode atingir).
    *   **Memória** (quanto está sendo puxado e o total adquirido).
    *   **Armazenamento/Disco**.
    *   Tempo que o servidor está online.
    *   Informações de envio e recebimento de dados da máquina, o que permite verificar a banda utilizada pelo servidor.

Em resumo, o Pterodactyl funciona como o **ponto central de controle** (o "cockpit") onde o cliente pode ligar, desligar, reiniciar o servidor, interagir via Console, gerenciar arquivos e configurar bancos de dados.

***

# Guia de Operação do Painel Pterodactyl

Este guia detalhado destina-se a clientes que utilizam o Painel Pterodactyl (também conhecido como "Piteiro" ou "Pterodáctilo") para gerenciar seus servidores hospedados. Este painel é amplamente utilizado por empresas de hospedagem (cerca de 95%). Embora a aparência do painel possa variar ligeiramente em cores, a estrutura e o visual são geralmente semelhantes.

## 1. Visão Geral e Status do Servidor (Início)

Ao acessar o painel, a tela inicial (Início) fornece informações em tempo real sobre o estado do seu servidor:

| Elemento | Descrição |
| :--- | :--- |
| **Nome do Servidor e Ícone** | Identificação do seu servidor. |
| **IP do Servidor** | O endereço IP do seu servidor. Este IP será provavelmente diferente do meu e do seu. |
| **CPU/Tempo de CPU** | Mostra o quanto de CPU o servidor está usando em tempo real e o limite de CPU que ele pode atingir (exemplo: 300%). |
| **Memória** | Mostra a memória que o servidor está consumindo no momento e o total de memória adquirida (exemplo: 6 GB). |
| **Armazenamento/Disco** | Indica o espaço em disco que o servidor está utilizando. |
| **Tempo Online** | O tempo que o servidor está ligado. |
| **Banda de Rede** | Informações sobre o envio e o recebimento de dados da sua máquina. O envio (azul) geralmente fica acima do recebimento, pois o usuário está mandando informações para o servidor. Isso permite verificar a banda utilizada pelo servidor. |

## 2. Controles Básicos do Servidor

No painel principal, você encontrará três botões essenciais para gerenciar o estado do servidor:

*   **Ligar** (Start): Inicia o servidor.
*   **Reiniciar** (Restart): Reinicia o servidor.
*   **Desligar** (Stop): Desliga o servidor.

## 3. Console (CMD)

O **Console** é a área principal onde você pode interagir diretamente com o servidor.

1.  **Localização:** É a área de texto onde são exibidas as mensagens do servidor.
2.  **Execução de Comandos:** Permite a execução de todos os comandos necessários (similar a um CMD no seu computador).
    *   **Exemplo:** Se o servidor for de Minecraft, você pode inserir comandos como `/gamemode [jogador]`.
3.  **Observação:** O procedimento de uso do Console é praticamente o mesmo para diferentes tipos de hospedagem, como Minecraft ou FiveM.

## 4. Gerenciamento de Arquivos (*Files/Pastas*)

A seção **Files** (Pastas) contém o corpo completo do seu servidor.

1.  **Conteúdo:** Aqui ficam arquivos cruciais como `Cash`, `Config`, `Lobby`, `Logs`, `Plugins`, e outros.
2.  **Ações Principais:**
    *   **Upload:** O método mais utilizado para enviar arquivos para a hospedagem.
    *   **Criar Novo Arquivo** (`New File`).
    *   **Criar Diretório** (`Create diretório`).
3.  **Arquivos Compactados:** É possível **extrair** arquivos zipados ou WinRAR diretamente dentro do painel.
4.  **SFTP:** Para acesso via programas externos (como FileZilla, que é usado para mexer na máquina), é necessário o domínio, usuário, senha e a porta (que geralmente é a padrão `2222`). **Nota de segurança:** O uso do gerenciador de arquivos interno é aconselhado, pois o uso de programas SFTP de terceiros (como o FileZilla) pode ter riscos de vírus.

## 5. Banco de Dados (*Databases*)

O banco de dados é usado para organizar as informações específicas de cada plugin ou aplicação, como se fosse uma estante que armazena livros organizados.

1.  **Criação:** Acesse a seção **Banco de Dados**.
2.  Clique em **New Database**.
3.  Defina um **nome** para o banco de dados.
4.  As informações de local (host) e porta geralmente são definidas pela empresa e podem não aparecer para você, mas serão necessárias para a configuração de plugins ou aplicações.

## 6. Sub-Usuários (*Users*)

A seção **Users** (também referida como *Name Use Name*) permite que você libere o acesso ao servidor para outras pessoas, como amigos ou colaboradores.

1.  **Adicionar Usuário:** Vá para a seção **Users** e clique em **New**.
2.  Insira o **e-mail** da pessoa.
3.  Defina as **permissões** que essa pessoa terá.
    *   **Exemplos de Permissões:**
        *   Acesso ao Console.
        *   Ligar, parar ou reiniciar o servidor.
        *   Operações de Arquivos: Criar, ler, atualizar (editar), excluir, e acesso ao SFTP.
    *   **Atenção:** É crucial ser cauteloso ao conceder acesso a áreas importantes, pois o usuário pode causar problemas no servidor.

## 7. Backups

O recurso **Backup** cria uma cópia do seu servidor, que pode ser baixada ou usada para recuperação.

1.  **Criação de Backup:**
    *   Acesse a seção **Backup**.
    *   Clique para criar um novo backup.
    *   Defina um **nome**.
    *   Você pode optar por ignorar alguns arquivos (não recomendado).
    *   O recurso "Look" (Cadeado) pode ser usado para proteger o backup, impedindo sua exclusão.
2.  **Gerenciamento:**
    *   Após a criação, use os três pontos (opções) para gerenciar o backup.
    *   As opções disponíveis são: **Download**, **Recuperar** (Restore), **Travar** (Lock/colocar cadeado), **Destravar** (Unlock), e **Deletar**.
3.  **Status:** Durante um backup muito grande, um cadeado pode aparecer na seção, impedindo o uso do painel momentaneamente.

## 8. Configurações de Inicialização (*Startup*)

A seção **Startup** contém as configurações avançadas sobre como seu servidor é iniciado e qual ambiente ele utiliza.

1.  **Start Commands:** É o código ou *flag* que faz o servidor iniciar.
2.  **Docker Image:** A imagem utilizada para rodar o servidor (exemplo: `1.07` ou `Java 8`).
3.  **Seleção de Versão:** Você pode selecionar a versão específica do servidor (exemplo: 1.8.8).
4.  **Atenção:** Geralmente, você só deve mexer na seleção da versão ou em parâmetros específicos de inicialização. Outros campos, como `server.jar` ou `build numeric`, geralmente devem ser mantidos como estão.

## 9. Atividades (*Activity*)

A seção **Atividades** foi adicionada recentemente e é muito importante para a segurança.

1.  **Propósito:** Registra todas as ações e alterações feitas dentro do painel.
2.  **Uso:** Se você deu acesso a um colega ou sub-usuário, esta seção permite verificar se alguma configuração foi alterada ou se houve atividades suspeitas, ajudando a identificar a origem de problemas de segurança.

***

**Analogia Final:** Pense no Painel Pterodactyl como o **Cockpit de um Avião**. A tela inicial mostra todos os indicadores vitais (CPU, memória, velocidade da rede), os botões de controle são para as ações de decolagem, voo e pouso (Ligar, Reiniciar, Desligar), o Console é o rádio de comunicação direta com o motor (para comandos específicos), e a seção de Arquivos é o compartimento de bagagem e manutenção, onde ficam todas as peças necessárias para o voo.

A função principal do **Console** (também chamado de **CMD** para maior familiaridade) é permitir a **execução de todos os comandos necessários** diretamente no servidor.

O Console é a área do Painel Pterodactyl onde as mensagens e o *output* do servidor são exibidos, e onde a interação direta ocorre.

Detalhes sobre a função e uso do Console:

*   **Execução de Comandos:** É o local onde você pode inserir e executar comandos. Por exemplo, em um servidor de Minecraft, é possível inserir comandos como o de dar "game mode" a um jogador, inserindo o comando correto em inglês junto ao *nick* do jogador.
*   **Similaridade com CMD:** O Console é semelhante ao CMD (Command Prompt) encontrado em seu próprio computador.
*   **Reflexo da Atividade:** O Console reflete a atividade em tempo real do servidor. Por exemplo, uma "alta atividade" é visível no Console após o usuário realizar ações no jogo, como andar ou bater.
*   **Procedimento Universal:** O procedimento para utilizar o Console é praticamente o mesmo para diferentes tipos de hospedagem, como Minecraft ou FiveM (GTA V multiplayer), embora o conteúdo das informações possa variar.
*   **Controle de Acesso:** O acesso ao Console é uma das permissões que pode ser concedida (ou revogada) a sub-usuários (*Users*) que você adiciona ao painel, sendo uma área importante que requer cautela ao liberar para outras pessoas.

Este documento fornece uma documentação completa e passo a passo sobre como hospedar um bot ou API (Application Programming Interface) utilizando o Painel Pterodactyl, baseando-se nas funcionalidades e nos procedimentos de hospedagem de aplicações que não sejam servidores de jogos tradicionais.

O Painel Pterodactyl pode ser utilizado para hospedar não apenas servidores de jogos (como Minecraft ou FiveM), mas também bots de **Telegram, Discord e WhatsApp**, e **APIs** que utilizam linguagens como **Node.js, Python ou PHP**.

***

# Documentação Completa: Hospedagem de Bots no Painel Pterodactyl

## 1. Configuração e Criação do Servidor

### 1.1 Escolha da Linguagem e Método de Hospedagem

Ao criar o servidor, você deve definir o ambiente de execução do seu bot.

1.  Acesse a área de **Servidores** e clique em `Criar Servidor`.
2.  Defina um **nome** para o servidor (ex: "Bot Aleatório"). O nome serve apenas para identificação e não interfere na funcionalidade.
3.  Em **Método de Hospedagem**:
    *   Se estiver hospedando seu **próprio projeto/API**, escolha `Linguagens`. Você verá opções como **Node.js, Python e PHP**. A escolha deve corresponder à linguagem em que sua aplicação foi desenvolvida.
    *   Se estiver utilizando um **bot pré-disponível** (por exemplo, um bot de WhatsApp que a hospedagem disponibiliza), você deve escolher a `Categoria` (ex: `Baileys` ou `Web JS`).
4.  Selecione a **localização** (ex: `br2`) e o **plano** desejado, que define a quantidade de CPU, RAM e Armazenamento.

## 2. Upload e Extração dos Arquivos do Bot

A seção **Files** (Pastas) é onde você irá carregar os arquivos do seu projeto.

### 2.1 Preparação dos Arquivos (Recomendado)

É **muito importante** enviar os arquivos do seu bot **sem os módulos** (como a pasta `node_modules` no Node.js). Isso evita que o envio demore muito.

1.  **Compacte** seu projeto em um arquivo `.zip`.

### 2.2 Envio e Descompactação

1.  Acesse a seção **Files** (Pastas) no painel.
2.  Use o recurso de **Upload** para enviar o arquivo `.zip` para a hospedagem.
3.  Após o envio, localize o arquivo `.zip`.
4.  Clique nos **três pontinhos** (opções) e selecione `Unarchive` para descompactar o arquivo (se o painel estiver em inglês).

### 2.3 Organização dos Arquivos

Se o seu arquivo `.zip` criou uma subpasta (ex: `api/` ou `bot/`) e o conteúdo do bot está dentro dela, você precisa mover os arquivos para a raiz do contêiner:

1.  Acesse a subpasta criada (ex: `api/`).
2.  Marque todos os arquivos clicando na primeira caixa (`caixinha`).
3.  Clique em `Move` (Mover).
4.  No campo de destino, insira `..` (dois pontos) e clique em `move`. Isso moverá os arquivos para a pasta anterior (a raiz do servidor).
5.  Volte para a raiz, selecione o arquivo `.zip` e a pasta vazia (ex: `api/`) e clique para **deletar** (`deletar`) para limpar o espaço.

## 3. Configuração de Inicialização (*Startup*)

A seção `Startup` é onde você garante que o bot será executado corretamente no ambiente (Docker Image) escolhido.

1.  Acesse a seção **Startup**.
2.  **Instalação de Módulos:** Verifique se a opção de instalação de módulos está ativada. Ao estar ativa, o painel irá instalar os módulos necessários através do arquivo `package.json`.
3.  **Comando de Início (*Start Commands*):** O painel utiliza um código (`Flag`) para iniciar a aplicação. Para Node.js, o comando padrão pode ser **`npm start`**, que executa o script de inicialização definido no `package.json`.
4.  **Configuração de Porta (Para APIs):** Se estiver hospedando uma API (que pode ser acessada via link), a porta que sua API escuta (`app.listen` no código) deve ser a mesma porta que o painel atribuiu ao seu servidor. Esta porta será exibida na tela inicial do Console (ex: `4022` ou `25565`). Você precisará ajustar o código da sua API para usar essa porta específica.

## 4. Execução e Monitoramento

### 4.1 Iniciando o Bot

1.  Retorne ao **Console**.
2.  Utilize o botão **Ligar** (*Start*) para iniciar a aplicação.
3.  O Console mostrará o processo de **instalação dos módulos** e, em seguida, o início da aplicação.

### 4.2 Monitoramento e Parelhamento (Exemplo: Bot de WhatsApp)

*   Se o bot for de WhatsApp, ele iniciará o processo de parelhamento.
*   O Console pode exibir um **QR Code** ou um código de parelhamento.
*   Caso seja um código de parelhamento, você deve ir ao seu WhatsApp (em um outro dispositivo), acessar `Aparelhos Conectados`, `Conectar um Aparelho`, e, em seguida, selecionar `Conectar com o número de telefone` e inserir o código gerado no Console.

### 4.3 Agendamento de Reinicialização (Recomendação)

Para **evitar sobrecarga de Cash** e manter a estabilidade do bot, é aconselhável configurar a reinicialização periódica.

1.  Acesse a seção **Sheduler** (Agendador).
2.  Crie um novo agendamento (`Create shedler`).
3.  Defina um nome (ex: "Reiniciar").
4.  Defina a frequência (ex: a cada **24 horas** ou outro intervalo).
5.  Crie uma nova tarefa (`New Task`).
6.  Em `Send Command`, selecione `Send Power Reaction`.
7.  Escolha a ação **Reiniciar o servidor** (`Restart server`) e marque para continuar mesmo após falha.

Este processo garantirá que o bot será reiniciado automaticamente no horário programado.

***

**Analogia:** Hospedar um bot é como montar um kit de montar. O Painel Pterodactyl é a **caixa de ferramentas** (Console, Files, Startup)-. A seção **Startup** é o **manual de instruções** que diz qual idioma (Node/Python) usar e qual botão apertar (`npm start`) para começar. Os **Files** são as **peças soltas** (seu código) que você deve montar (descompactar e mover) na área de trabalho. Ao final, o **Console** é a **luz de funcionamento** que mostra se o kit está ligado e operando.

A funcionalidade de **Backup** no Painel Pterodactyl é essencialmente um recurso que cria uma cópia de segurança do seu servidor.

Com base nas fontes, aqui está o que é e como funciona um backup:

### Definição e Propósito

*   Um backup **faz uma cópia do seu servidor**.
*   É, na prática, **uma cópia do seu servidor**.
*   Essa cópia fica no painel, onde o usuário pode:
    *   Fazer o **download** da cópia.
    *   **Recuperar** (Restore) o servidor a partir dessa cópia.

### Criação e Gerenciamento

Ao criar um backup, o usuário pode:

1.  **Dar um nome** ao backup.
2.  Optar por **ignorar algumas pastas** (*faixas*), embora isso não seja aconselhado.
3.  Utilizar o recurso **"look"** (cadeado), que é uma funcionalidade nova, para **travar** o backup. Esse recurso proíbe a exclusão do backup até que ele seja desbloqueado.

Se o backup for **muito grande**, um **cadeado** pode aparecer na seção, o que **impede o uso** do painel momentaneamente enquanto o processo está ocorrendo.

As opções disponíveis para gerenciar um backup criado (acessíveis pelos três pontos) incluem:

*   **Download**.
*   **Recuperar** (Restore).
*   **Travar** (colocar um cadeado).
*   **Destravar** (remover o cadeado).
*   **Deletar**.

Com base nas informações fornecidas, este é um tutorial completo e passo a passo sobre como utilizar um **bot que já se encontra disponível** na plataforma de hospedagem, usando o Painel Pterodactyl.

Este procedimento é específico para bots que são oferecidos como parte do serviço de hospedagem (como bots de WhatsApp prontos), e não para o *upload* de um bot personalizado ou API.

***

# Tutorial: Utilizando um Bot Disponível no Painel Pterodactyl

## 1. Criação e Seleção do Tipo de Bot

O primeiro passo é criar um novo servidor e selecionar a categoria correta para o bot que você deseja utilizar.

1.  No lado esquerdo do Painel, clique nas três barras (`três Barrinhas`) e vá para a seção **Servidores**.
2.  Clique em `Criar Servidor`.
3.  **Nome do Servidor:** Insira um nome para o servidor (ex: "aleató BR" ou "cachorro gato Tigre"). O nome não interfere em nada, é apenas para identificação.
4.  **Método de Hospedagem:** Nesta seção, você deve escolher a categoria que contém os bots já disponíveis:
    *   Se for hospedar seu **próprio bot/API**, você escolheria `Linguagens`.
    *   Se for utilizar um **Bot que já está disponível no site** (por exemplo, Bots de WhatsApp), escolha a categoria específica.
5.  **Seleção da Biblioteca (Categoria):** Escolha a biblioteca ou categoria do bot:
    *   **Baileys** (ou `Bailes`): É a opção mais completa e estável na atualidade, sendo mais indicada para **baixo consumo de RAM** e uso em vários grupos.
    *   **Web JS**: É uma biblioteca diferente, que geralmente é mais pesada e pode ter menos bots disponíveis.
6.  **Plano e Localização:** O sistema escolherá o servidor mais atualizado e disponível (ex: `br2` ou `br1`). Escolha o plano de servidor (ex: Bronze, Prata, Ouro, Premium) que define a quantidade de RAM, CPU e armazenamento. Os planos podem variar de consumo mensal ou por hora.

## 2. Gerenciamento e Configuração Inicial

Após a criação do servidor, você será enviado para a área de gerenciamento.

1.  Acesse o servidor criado clicando em **Gerir**.
2.  Você estará no **Console**, onde verá as opções básicas de controle:
    *   **Start** (Ligar).
    *   **Restart** (Reiniciar).
    *   **Stop** (Parar).
3.  **Seleção Específica do Bot (Se aplicável):** Dependendo do seu provedor, dentro da seção **Startup**:
    *   Você pode ver a lista dos **Bots disponíveis na host** (ex: Sakura, Sabrina, Shadow, Noel).
    *   Selecione o bot desejado.
    *   *Nota: Lembre-se que alguns bots disponíveis são criptografados e a hospedagem não se responsabiliza por problemas, pois são criadores diferentes*.

## 3. Configurando a Reinicialização Programada (*Scheduler*)

É altamente recomendado configurar um agendamento para reiniciar o bot, o que ajuda a **evitar sobrecarga de Cash** e a manter o bot estável e leve.

1.  No lado esquerdo, vá para a seção **Sheduler** (ou Agendador).
2.  Clique em `Create shedler`.
3.  Defina um nome (ex: "reiniciar").
4.  Defina a frequência da reinicialização (ex: a cada **24 horas** ou outro intervalo desejado).
5.  Crie uma nova tarefa clicando em `New Task`.
6.  Em `Send Command`, selecione `Send Power Re Action`.
7.  Escolha a ação **Reiniciar o servidor** (`Restart server`) e marque a opção para continuar mesmo após falha.

## 4. Inicialização e Parelhamento do Bot

O bot geralmente usa o **Console** para fornecer informações de parelhamento, especialmente se for um bot de WhatsApp.

1.  Volte ao **Console** e clique em **Start** (Ligar).
2.  O Console fará a instalação (se necessário) e iniciará o bot.
3.  Ele irá gerar um **QR Code** ou um **código de parelhamento**.

### Parelhamento via Código:

Se o bot gerar um código (e não um QR Code):

1.  O console pode pedir que você **coloque o número** que será o bot (incluindo o prefixo `+55` e o DDD, sem espaços).
2.  Acesse o **WhatsApp** no seu dispositivo (que será pareado).
3.  Vá para `Aparelhos Conectados`.
4.  Selecione `Conectar um Aparelho`.
5.  Selecione `Conectar com o número de telefone` (localizado na parte inferior da tela).
6.  Insira o código de parelhamento que foi gerado no **Console** do Pterodactyl.

Após inserir o código, o bot estará conectado e pronto para funcionar em grupos.

### Parelhamento Avançado (Comando `start.sh`):

Em alguns casos, para que o bot inicie o processo de parelhamento corretamente, o comando de *start* padrão pode precisar ser ajustado:

1.  Se o bot exigir o uso de um comando específico como `sh start.sh`, você pode precisar acessar a seção **Files** (Pastas).
2.  Localize o arquivo `package.json`.
3.  Edite este arquivo para garantir que o *script* de inicialização (que o painel executa via `npm start`) chame o comando correto (ex: `sh start.sh`).
4.  **Salve** o arquivo e volte ao **Console** para iniciar o bot.


---

*Este arquivo foi criado especificamente para assistentes de IA (Claude, ChatGPT, etc) entenderem completamente o projeto Takeshi Bot e auxiliarem desenvolvedores de forma precisa e contextualizada.*