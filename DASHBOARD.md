# 🎛️ Dashboard Takeshi Bot

Painel de monitoramento web para o Takeshi Bot com informações em tempo real sobre o status e operação do bot.

## 🚀 Funcionalidades

- **Status de Conexão**: Visualize se o bot está conectado ou desconectado
- **Uptime**: Acompanhe há quanto tempo o bot está rodando
- **Estatísticas**:
  - Total de comandos disponíveis
  - Quantidade de grupos no bot
  - Usuários silenciados
  - Auto-responders ativos
  - Versão do bot
- **Informações do Sistema**:
  - Versão do Node.js
  - Plataforma (Windows, Linux, etc)
  - Uso de memória em tempo real
  - Quantidade de CPU cores
  - Última atualização

## 📡 Como Acessar

### Localmente

```
http://localhost:3000
```

### Em uma VPS/Host

```
http://SEU_IP:3000
```

Substitua `SEU_IP` pelo IP do seu servidor.

### Comando WhatsApp

Para obter o link do dashboard, envie para o bot (só funciona se você for o dono):

```
/dashboard
```

## 🔌 API

O dashboard expõe uma API JSON para integração:

### GET /api/stats

Retorna as estatísticas em tempo real:

```bash
curl http://localhost:3000/api/stats
```

**Resposta:**

```json
{
  "startTime": 1234567890,
  "isConnected": true,
  "totalCommands": 78,
  "totalGroups": 5,
  "mutedUsers": 2,
  "autoResponders": 10,
  "uptime": 3600000
}
```

## 🛠️ Configuração

A porta padrão do dashboard é `3000`. Para alterar, edite o arquivo `src/index.js`:

```javascript
// Procure por:
startDashboard(3000);

// E altere para:
startDashboard(8080); // Sua porta desejada
```

## 🔒 Segurança

⚠️ **Importante**: O dashboard é acessível sem autenticação. Para protegê-lo:

1. **Firewall**: Configure seu firewall para bloquear acesso à porta 3000 de fora
2. **Proxy Reverso**: Use Nginx ou Apache com autenticação
3. **Acesso Local**: Recomenda-se usar apenas localmente em desenvolvimento

## 📊 Atualização de Dados

Os dados são atualizados:

- **Em tempo real**: Ao abrir a página (clique em "Atualizar")
- **A cada 5 minutos**: Automaticamente no bot
- **Contínuamente**: Informações de uptime e memória (em tempo real na página)

## 🐛 Troubleshooting

### Dashboard não carrega

- Verifique se a porta 3000 está disponível
- Verifique se o bot iniciou corretamente
- Verifique os logs do bot

### Dados incorretos

- Clique em "Atualizar" para recarregar
- Verifique se os arquivos de database estão íntegros
- Reinicie o bot

## 📝 Notas

- O dashboard foi criado com Node.js puro (sem dependências extras)
- É totalmente responsivo e funciona em mobile
- Todos os dados são obtidos em tempo real do sistema
