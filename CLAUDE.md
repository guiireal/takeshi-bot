# 🤖 TAKESHI BOT - Documentação Completa para IA

> **Última atualização:** 1 de Novembro de 2025  
> **Versão:** 6.6.0  
> **Autor:** Dev Gui (Guilherme França)

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
const { connect } = require("./src/connection");
const { load } = require("./src/loader");
const { badMacHandler } = require("./src/utils/badMacHandler");

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
- [ ] Usa BASE_DIR para imports
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
│   ├── get-id.js         # Obter ID do grupo
│   ├── off.js            # Desligar bot no grupo
│   ├── on.js             # Ligar bot no grupo
│   ├── set-bot-number.js
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
    │   ├── play-audio.js
    │   ├── play-video.js
    │   ├── tik-tok.js
    │   ├── yt-mp3.js
    │   └── yt-mp4.js
    │
    ├── 📁 ia/             # Inteligência Artificial
    │   ├── gemini.js
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

**Como funciona a verificação de permissão:**

```javascript
// src/utils/dynamicCommand.js (simplificado)

if (command.category === "owner") {
  if (!isOwner) {
    throw new Error("Apenas o dono pode usar este comando!");
  }
}

if (command.category === "admin") {
  if (!isAdmin && !isOwner) {
    throw new Error("Apenas admins podem usar este comando!");
  }
}

// member = qualquer um pode usar
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
const data = JSON.parse(fs.readFileSync('database/config.json'));

// ✅ SEMPRE faça isso:
const { getPrefix, setBotNumber } = require('./utils/database');
const prefix = getPrefix(groupJid);  // Busca no DB, fallback para config
```

---

## ⚙️ CONFIGURAÇÃO E PERSONALIZAÇÃO

### Arquivo `src/config.js`

**Configurações principais:**

```javascript
// Prefixo padrão (pode ser sobrescrito por grupo)
exports.PREFIX = "/";

// Identidade do bot
exports.BOT_EMOJI = "🤖";
exports.BOT_NAME = "Takeshi Bot";

// Números (apenas dígitos, sem símbolos)
exports.BOT_NUMBER = "6285792267279";
exports.OWNER_NUMBER = "5511996122056";
exports.OWNER_LID = "134875512348681@lid";

// API externa (Spider X API)
exports.SPIDER_API_BASE_URL = "https://api.spiderx.com.br/api";
exports.SPIDER_API_TOKEN = "asOjDIpVROlnghw4jKDt";

// Grupo específico (deixe vazio para responder todos)
exports.ONLY_GROUP_ID = "";

// Modo desenvolvedor (loga todas mensagens)
exports.DEVELOPER_MODE = false;

// Timeout anti-ban (ms)
exports.TIMEOUT_IN_MILLISECONDS_BY_EVENT = 700;
```

**Comandos para configurar em runtime:**

```bash
/set-prefix #              # Muda prefixo do grupo
/set-bot-number +5511...   # Define número do bot
/set-owner-number +5511... # Define número do dono
/set-spider-api-token ...  # Define token da API
```

---

### Personalização do Menu

**Arquivo:** `src/menu.js`

**Estrutura:**
```javascript
exports.menuMessage = (groupJid) => {
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
▢ • ${prefix}get-id
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
module.exports = {
  welcomeMessage: "Seja bem vindo ao nosso grupo, @member!",
  exitMessage: "Poxa, @member saiu do grupo... Sentiremos sua falta!",
};
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
| `baileys` | ^6.7.20 | WhatsApp Web API (conexão principal) |
| `axios` | ^1.11.0 | Requisições HTTP (downloads, APIs) |
| `@cacheable/node-cache` | ^1.6.1 | Cache avançado |
| `node-cache` | ^5.1.2 | Cache em memória (metadados grupo) |
| `fluent-ffmpeg` | ^2.1.3 | Conversão áudio/vídeo |
| `node-webpmux` | ^3.2.1 | Criação/edição de stickers WebP |
| `openai` | ^5.11.0 | Integração ChatGPT/GPT-4 |
| `pino` | ^9.7.0 | Logger performático |
| `tiktoken` | ^1.0.21 | Contagem de tokens (IA) |
| `correios-brasil` | ^3.0.6 | Consulta CEP brasileiro |

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
3. **Estrutura:** Sempre use `BASE_DIR` para imports relativos
4. **Permissões:** Crie comando na pasta correta (admin/member/owner)
5. **Database:** Use funções de `src/utils/database.js`, nunca leia JSON diretamente
6. **Tipos:** Consulte `src/@types/index.d.ts` para CommandHandleProps

---

## 🔧 CONTRIBUINDO

### Checklist para PRs

**Obrigatório:**
- [ ] Testado no Node.js 22
- [ ] Screenshots do comando funcionando
- [ ] Usa template de comandos
- [ ] Importa `CommandHandleProps`
- [ ] Usa `BASE_DIR` para imports
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
- [Bores Host](https://loja.botbores.shop/)

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
| **get-id** | get-group-id, id-get, id-group | Obtém JID completo do grupo | `${PREFIX}get-id` - Retorna remoteJid para configurações |
| **off** | - | Desativa bot no grupo específico | `${PREFIX}off` - Adiciona grupo à `inactive-groups.json` |
| **on** | - | Ativa bot no grupo específico | `${PREFIX}on` - Remove grupo da `inactive-groups.json` |
| **set-bot-number** | altera-numero-bot, muda-numero-bot, etc | Define número do bot na config | `${PREFIX}set-bot-number 5511999999999` - Atualiza `config.json` |
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
| **refresh** | - | Atualiza cache de grupos | `${PREFIX}refresh` - Limpa NodeCache |

#### **📥 Downloads (5 comandos)**
| Comando | Aliases | Função | Uso Técnico |
|---------|---------|--------|-------------|
| **tik-tok** | ttk | Download vídeos TikTok | `${PREFIX}tik-tok URL` - Spider X API `/tik-tok` |
| **yt-mp3** | - | Download áudio YouTube | `${PREFIX}yt-mp3 URL` - Extração MP3 via API |
| **yt-mp4** | - | Download vídeo YouTube | `${PREFIX}yt-mp4 URL` - Qualidade automática |
| **play-audio** | - | Busca e baixa áudio | `${PREFIX}play-audio música` - Search + download |
| **play-video** | - | Busca e baixa vídeo | `${PREFIX}play-video clipe` - Search + download |

#### **🤖 Inteligência Artificial (3 comandos)**
| Comando | Aliases | Função | Uso Técnico |
|---------|---------|--------|-------------|
| **gemini** | takeshi | Chat com Google Gemini | `${PREFIX}gemini pergunta` - API Gemini Pro |
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
| **set-owner-number** | altera-numero-dono, etc | Define número do dono | `${PREFIX}set-owner-number 5511999999999` |
| **rename** | - | Renomeia arquivo | `${PREFIX}rename novo-nome` - Altera fileName metadata |
| **gerar-link** | - | Gera link de convite | `${PREFIX}gerar-link` - Cria invite temporário |
| **get-lid** | - | Obtém LID do usuário | `${PREFIX}get-lid` - Metadata de LID |

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

## 🔧 TROUBLESHOOTING E SUPORTE TÉCNICO

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
exports.DEVELOPER_MODE = true;
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
const { isActiveGroup, getPrefix } = require('./utils/database');
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
1. **set-owner-number** - SEMPRE configure primeiro
2. **set-spider-api-token** - Necessário para IA e downloads
3. **exec** - Use com EXTREMA cautela (proteções implementadas)

**Boas Práticas:**
- Configure owner number antes de outras operações
- Mantenha token Spider X API atualizado
- Use `exec` apenas para debugging/manutenção
- Teste `get-id` para obter JIDs corretos

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
- **tik-tok**: URL completa necessária
- **yt-mp3/mp4**: Suporta URLs e search
- **play-audio/video**: Busca automática + download

**IA (`/ia`):**
- **gemini**: Conversação natural
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
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "meu-comando",
  description: "Faz algo legal",
  commands: ["meu-comando", "mc"],
  usage: `${PREFIX}meu-comando <argumento>`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
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
- `src/commands/owner/` - 8 comandos (exec, set-*, get-id, on/off)
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
- ✅ Use `BASE_DIR` para imports: `require(\`\${BASE_DIR}/config\`)`
- ✅ Use funções de `utils/database.js`: `getPrefix()`, `setBotNumber()`
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

**Última atualização:** 2 de Novembro de 2025  
**Versão da documentação:** 2.0.0  
**Comandos documentados:** 110+  
**Maintainer:** Dev Gui ([@devgui_](https://youtube.com/@devgui_))

---

*Este arquivo foi criado especificamente para assistentes de IA (Claude, ChatGPT, etc) entenderem completamente o projeto Takeshi Bot e auxiliarem desenvolvedores de forma precisa e contextualizada.*
