# Guia de Contribuição - Takeshi Bot 🤖

O Takeshi é um bot open source (código aberto), o que significa que você pode contribuir com melhorias, correções de bugs e adição de novas funcionalidades.

## 🚀 Como contribuir

### Antes de abrir um pull request

1. **Fork** o repositório
2. **Clone** seu fork localmente
3. **Crie uma branch** com nome descritivo: `feature/novo-comando-ban` ou `fix/corrige-download`
4. **Implemente** suas mudanças seguindo os padrões do projeto
5. **Teste** suas mudanças no Node.js versão 22
6. **Documente** com prints do comando funcionando

## 📋 Template Obrigatório para pull requests

Seu PR deve seguir este padrão:

### Título

Descrição clara do que está sendo feito

### Tipo de mudança

- [ ] 🐛 **Bug fix** (correção que resolve um problema)
- [ ] ✨ **Nova funcionalidade** (adiciona funcionalidade)
- [ ] 💥 **Breaking change** (mudança que quebra funcionalidade existente)
- [ ] ♻️ **Refatoração** (melhoria de código sem adicionar funcionalidade)
- [ ] 📚 **Documentação** (mudanças apenas na documentação)

### Descrição detalhada

Explique:

- O que foi implementado/corrigido
- Por que a mudança é necessária
- Como funciona a solução

### Checklist obrigatório

- [ ] Foi testado na versão 22 do Node.js
- [ ] Inclui prints/screenshots do comando em funcionamento
- [ ] Usa funções existentes da pasta `utils` (não reinventa a roda)
- [ ] Importa `CommandHandleProps` corretamente
- [ ] Usa `BASE_DIR` para imports nos comandos
- [ ] Código comentado adequadamente

## 🔧 Criando novos comandos

### Template obrigatório

Use o arquivo `🤖-como-criar-comandos.js` como base. **SEMPRE** copie este template:

```javascript
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "comando",
  description: "Descrição do comando",
  commands: ["comando1", "comando2"],
  usage: `${PREFIX}comando`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({}) => {
    // código do comando
  },
};
```

### Estrutura de pastas para comandos

- **`src/commands/owner/`** - Comandos exclusivos do dono do bot
- **`src/commands/admin/`** - Comandos para administradores do grupo
- **`src/commands/member/`** - Comandos para qualquer membro

## ✅ Checklist completo para PRs

### Código

- [ ] Segue o template de comandos
- [ ] Usa `BASE_DIR` nos imports
- [ ] Importa `CommandHandleProps` corretamente
- [ ] Utiliza funções existentes da pasta `utils`
- [ ] Código bem comentado em português
- [ ] Variáveis e funções com nomes descritivos

### Testes

- [ ] Testado no Node.js versão 22
- [ ] Comando funciona corretamente em grupos
- [ ] Comando funciona corretamente em chat privado (se aplicável)
- [ ] Testado com diferentes tipos de entrada

### Performance

- [ ] Não trava o bot
- [ ] Usa delays apropriados (`randomDelay()` ou `delay()`)
- [ ] Limpa arquivos temporários se criados
- [ ] Não consome memória excessiva

## 📸 Screenshots obrigatórios

Todo PR com novos comandos deve incluir:

1. **Print do comando sendo executado com sucesso**
2. **Print da resposta do bot**
3. **Print de erro (se o comando tratar erros)**

## 🚫 O que NÃO fazer

- ❌ Não reinvente funções que já existem
- ❌ Não use `require()` absolutos, sempre use `BASE_DIR` se o que você estiver abrindo for um comando novo
- ❌ Não ignore o template de comandos
- ❌ Não esqueça de testar no Node.js 22
- ❌ Não faça commits sem prints do funcionamento
- ❌ Não misture múltiplas funcionalidades em um PR

## 🎯 Dicas para um bom PR

1. **Mantenha pequeno**: PRs menores são mais fáceis de revisar
2. **Uma responsabilidade**: Um PR deve resolver apenas um problema
3. **Teste bem**: Garanta que funciona em diferentes cenários
4. **Seja claro**: Título e descrição devem explicar o que e por quê
5. **Use exemplos**: Inclua exemplos de uso do comando

## 📞 Suporte

Dúvidas sobre contribuição?

- Abra uma issue
- Verifique issues existentes antes de criar nova
- Seja específico sobre o problema ou dúvida

---

**Lembre-se:** Contribuições de qualidade ajudam a comunidade inteira!
