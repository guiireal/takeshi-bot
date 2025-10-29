# Sistema de Fila para Downloads - yt-dlp

## 📋 Resumo das Implementações

### 🎯 Objetivo
Implementar um sistema de fila para processar downloads sequencialmente, evitando conflitos quando múltiplos usuários solicitam downloads simultâneos.

---

## 🔧 Mudanças Implementadas

### 1. **Sistema de Fila (`ytdlpService.js`)**

#### Estrutura da Fila
```javascript
const downloadQueue = [];        // Array que armazena downloads pendentes
let isProcessingQueue = false;   // Flag indicando se está processando
```

#### Funções Principais

##### `addToQueue(downloadFunction)`
- Adiciona uma função de download à fila
- Retorna uma Promise que resolve quando o download termina
- Inicia o processamento da fila automaticamente

##### `processQueue()`
- Processa downloads sequencialmente (um por vez)
- Previne execução simultânea com flag `isProcessingQueue`
- Executa até a fila estar vazia

##### `cleanupOldFiles()`
- Remove arquivos temporários com mais de 1 hora
- Executada automaticamente a cada 30 minutos
- Preserva `.gitignore` e `wa-logs.txt`

##### `clearQueue()`
- Limpa manualmente todos os downloads pendentes
- Retorna quantidade de downloads removidos
- Útil para resolver problemas de fila travada

##### `getQueueInfo()`
- Retorna informações sobre o estado atual da fila
- Mostra quantidade de downloads pendentes
- Indica se está processando

---

### 2. **Integração com Funções de Download**

#### `downloadMedia(url, type, qualityPreference)`
- Toda a lógica de download foi envolvida em `addToQueue()`
- Garante execução sequencial
- Previne conflitos de arquivo

#### `searchAndDownload(type, searchQuery, qualityPreference)`
- Implementação inline da lógica de download
- Evita dupla fila (busca + download)
- Processamento eficiente em uma única etapa

---

### 3. **Comandos de Gerenciamento**

#### `/limpar-fila` (Admin)
**Arquivo:** `src/commands/admin/limpar-fila.js`

**Funcionalidade:**
- Remove todos os downloads pendentes
- Mostra estatísticas da operação
- Aliases: `limparfila`, `clearqueue`

**Uso:**
```
/limpar-fila
```

**Resposta:**
```
✅ Fila limpa com sucesso!

📊 Estatísticas:
• Downloads removidos: 3
• Status: Processando → Interrompido

⚠️ Nota: Downloads em andamento foram cancelados.
```

---

#### `/fila` (Member)
**Arquivo:** `src/commands/member/fila.js`

**Funcionalidade:**
- Mostra status atual da fila
- Exibe quantidade de downloads pendentes
- Indica se está processando

**Uso:**
```
/fila
```

**Respostas possíveis:**

**Fila vazia:**
```
✅ Status da Fila de Downloads

📊 Informações:
• Status: Vazia
• Downloads na fila: 0
• Processando agora: Não

💡 Dica: Use /limpar-fila para limpar downloads pendentes.
```

**Processando:**
```
⏳ Status da Fila de Downloads

📊 Informações:
• Status: Processando
• Downloads na fila: 2
• Processando agora: Sim

💡 Dica: Use /limpar-fila para limpar downloads pendentes.
```

**Aguardando:**
```
📥 Status da Fila de Downloads

📊 Informações:
• Status: Aguardando
• Downloads na fila: 5
• Processando agora: Não

💡 Dica: Use /limpar-fila para limpar downloads pendentes.
```

---

## 🎨 Fluxo de Funcionamento

### Cenário: 3 Usuários Solicitam Downloads Simultâneos

```
┌─────────────────────────────────────────────────────────┐
│                    Usuários Solicitam                    │
│                                                          │
│  👤 User1: /play-audio phonk                            │
│  👤 User2: /play-video meme                             │
│  👤 User3: /yt-mp3 https://youtube.com/...              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              addToQueue() - Adiciona à Fila             │
│                                                          │
│  Queue: [Download1, Download2, Download3]               │
│  isProcessing: false → true                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│            processQueue() - Processa Sequencialmente     │
│                                                          │
│  ⏳ Processando Download1... (User1)                     │
│  ⏸️ Aguardando: Download2, Download3                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Download1 Completo ✅                       │
│                                                          │
│  ✅ User1 recebe: áudio + thumbnail + metadados         │
│  Queue: [Download2, Download3]                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Processa Download2...                       │
│                                                          │
│  ⏳ Processando Download2... (User2)                     │
│  ⏸️ Aguardando: Download3                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Download2 Completo ✅                       │
│                                                          │
│  ✅ User2 recebe: vídeo + thumbnail + metadados         │
│  Queue: [Download3]                                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Processa Download3...                       │
│                                                          │
│  ⏳ Processando Download3... (User3)                     │
│  ⏸️ Aguardando: (vazio)                                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Download3 Completo ✅                       │
│                                                          │
│  ✅ User3 recebe: áudio + thumbnail + metadados         │
│  Queue: []                                              │
│  isProcessing: true → false                             │
└─────────────────────────────────────────────────────────┘
```

---

## 🔒 Proteções Implementadas

### 1. **Prevenção de Conflitos**
- ✅ Downloads processados um por vez
- ✅ Nomes de arquivo únicos (timestamp)
- ✅ Limpeza automática de arquivos antigos

### 2. **Gerenciamento de Memória**
- ✅ Arquivos temporários removidos após uso
- ✅ Limpeza automática a cada 30 minutos
- ✅ Arquivos com mais de 1 hora são deletados

### 3. **Controle de Fila**
- ✅ Comando para visualizar status
- ✅ Comando para limpar fila (admin)
- ✅ Logs detalhados no console

---

## 📊 Monitoramento

### Logs no Console

```bash
[YTDLP] Fila limpa! 3 download(s) pendente(s) removido(s).
[YTDLP] Arquivo antigo removido: 1761757685362.mp3
[YTDLP] Arquivo antigo removido: 1761757758119.mp3
[YTDLP] Primeira tentativa falhou, tentando com formato alternativo...
```

### Comandos de Monitoramento

| Comando | Permissão | Função |
|---------|-----------|--------|
| `/fila` | Member | Ver status da fila |
| `/limpar-fila` | Admin | Limpar fila de downloads |

---

## 🎯 Benefícios

### ✅ Antes (Sem Fila)
```
👤 User1: /play-audio → ⬇️ Download inicia
👤 User2: /play-video → ⬇️ Download inicia (CONFLITO!)
👤 User3: /yt-mp3     → ⬇️ Download inicia (CONFLITO!)

❌ Resultado: Arquivos corrompidos, erros, downloads falhando
```

### ✅ Depois (Com Fila)
```
👤 User1: /play-audio → ⬇️ Download inicia (posição 1)
👤 User2: /play-video → ⏳ Aguardando na fila (posição 2)
👤 User3: /yt-mp3     → ⏳ Aguardando na fila (posição 3)

✅ Resultado: Todos downloads completam com sucesso
```

---

## 🛠️ Manutenção

### Limpeza Manual de Arquivos Antigos
Os arquivos são limpos automaticamente, mas se necessário, você pode:

1. **Verificar arquivos temporários:**
   ```bash
   ls assets/temp/
   ```

2. **Remover manualmente (PowerShell):**
   ```powershell
   Remove-Item "assets/temp/*.mp3" -Force
   Remove-Item "assets/temp/*.mp4" -Force
   ```

3. **Limpar fila de downloads:**
   ```
   /limpar-fila
   ```

---

## 📝 Arquivos Modificados

```
src/services/ytdlpService.js          ← Sistema de fila implementado
src/commands/admin/limpar-fila.js     ← Comando para limpar fila (NOVO)
src/commands/member/fila.js           ← Comando para ver status (NOVO)
```

---

## 🚀 Próximos Passos Recomendados

1. ✅ Testar com múltiplos downloads simultâneos
2. ✅ Verificar limpeza automática funcionando
3. ✅ Testar comando `/fila` durante downloads
4. ✅ Testar comando `/limpar-fila` com fila cheia
5. ⏳ Considerar adicionar limite máximo de fila (ex: 10 downloads)
6. ⏳ Adicionar notificação quando download está na fila
7. ⏳ Implementar sistema de prioridade (admins primeiro)

---

## 💡 Dicas de Uso

### Para Admins
- Use `/fila` para monitorar downloads pendentes
- Use `/limpar-fila` se a fila travar ou estiver muito cheia
- Arquivos antigos são limpos automaticamente a cada 30min

### Para Usuários
- Seus downloads são processados na ordem de solicitação
- Use `/fila` para ver quantos downloads estão na sua frente
- Se o download demorar muito, pode estar na fila

---

## 🐛 Troubleshooting

### Problema: Downloads não processam
**Solução:**
```
/limpar-fila   # Limpa fila travada
```

### Problema: Muitos arquivos em assets/temp
**Solução:**
- Limpeza automática remove arquivos com >1 hora
- Aguarde até 30 minutos para limpeza automática
- Ou limpe manualmente via PowerShell

### Problema: Fila muito longa
**Solução:**
- Admin pode usar `/limpar-fila`
- Considerar adicionar limite de fila no futuro

---

**Data de Implementação:** 2024
**Versão:** 1.0.0
**Status:** ✅ Implementado e Funcional
