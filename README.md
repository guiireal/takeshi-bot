# 🤖 Takeshi Bot

<div align="center">
    <img src="./assets/images/takeshi-bot.png" width="500">
</div>

<br />

<div align="center">
    <a href="https://github.com/Projetos-Crescer/zig-app">
        <img alt="Version" src="https://img.shields.io/badge/Vers%C3%A3o-2.0.0-blue">
    </a>
</div>

<br />

## Bot de WhatsApp multi funções, desenvolvido no vídeo:

[CRIANDO UM BOT DE WHATSAPP DO ZERO (GUIA DEFINITIVO) - BASE COMPLETA + 6 COMANDOS - JAVASCRIPT](https://youtu.be/6zr2NYIYIyc)

![Logger](./assets/images/logger.png)

## Tecnologias envolvidas

- [Axios](https://axios-http.com/ptbr/docs/intro)
- [Baileys](https://github.com/WhiskeySockets/Baileys)
- [FFMPEG](https://ffmpeg.org/)
- [Node.js 20.17.0](https://nodejs.org/en)
- [Spider X API](https://api.spiderx.com.br)

## Instalação no Termux <a id="termux-setup"></a>

1 - Abra o Termux e execute os seguintes comandos. Não tem o Termux? [Clique aqui e baixe a última versão.](https://www.mediafire.com/file/082otphidepx7aq/Termux_0.119.1_aldebaran_dev.apk/file)
```
pkg upgrade -y && pkg update -y && pkg install git -y
```

2 - Habilite o acesso da pasta storage, no termux.
```
termux-setup-storage
```

3 - Entre na pasta storage (ou dê antes um `ls` e veja qual é o nome da pasta do seu cartão de memória e entre nela).
```
cd storage
```

4 - Clone o repositório.
```
git clone https://github.com/guiireal/takeshi-bot.git
```

5 - Entre na pasta que foi clonada.
```
cd takeshi-bot
```

6 - Execute o bot.
```
sh termux-start.sh
```

7 - Insira o número de telefone e pressione `enter`.

8 - Informe o código que aparece no termux, no seu WhatsApp, [assista aqui, caso não encontre essa opção](https://youtu.be/6zr2NYIYIyc?t=5395).

9 - Aguarde 10 segundos, depois digite `CTRL + C` para parar o bot.

10 - Configure o arquivo `config.js` que está dentro da pasta `src`.

```js
// Prefixo dos comandos
exports.PREFIX = "/";

// Emoji do bot (mude se preferir).
exports.BOT_EMOJI = "🤖";

// Nome do bot (mude se preferir).
exports.BOT_NAME = "Takeshi Bot";

// Número do bot. Coloque o número do bot (apenas números).
exports.BOT_NUMBER = "5511920202020";

// Número do dono do bot. Coloque o número do dono do bot (apenas números).
exports.OWNER_NUMBER = "5511999999999";
```

11 - Inicie o bot novamente
```
npm start
```

## Alguns comandos necessitam de API

Edite a linha `34` do arquivo `./src/config.js` e cole sua api key da plataforma Spider X API.<br/>
Para obter seu token, acesse: [https://api.spiderx.com.br](https://api.spiderx.com.br) e crie sua conta gratuitamente!

```js
exports.SPIDER_API_TOKEN = "seu_token_aqui";
```
## Funcionalidades

| Função | Online? | Contexto | Requer a Spider X API?
| ------------ | --- | --- | ---
| Desligar o bot no grupo | ✅ | Dono | ❌
| Ligar o bot no grupo | ✅ | Dono | ❌
| Banir membros | ✅ | Admin | ❌
| Ligar/desligar auto responder | ✅ | Admin | ❌
| Ligar/desligar boas vindas | ✅ | Admin | ❌
| Marcar todos | ✅ | Admin | ❌
| Busca CEP | ✅ | Membro | ❌
| Figurinha de texto animada | ✅ | Membro | ✅
| Geração de imagens com IA | ✅ | Membro | ❌
| GPT | ✅ | Membro | ✅
| Ping | ✅ | Membro | ❌
| Play áudio | ✅ | Membro | ✅
| Play vídeo | ✅ | Membro | ✅
| Sticker | ✅ | Membro | ❌
| Sticker para imagem | ✅ | Membro | ❌

## Auto responder

O Takeshi Bot possui um auto-responder embutido, edite o arquivo em `./assets/database/auto-responder.json`:

```json
[
    {
        "match": "Oi",
        "answer": "Olá, tudo bem?"
    },
    {
        "match": "Tudo bem",
        "answer": "Estou bem, obrigado por perguntar"
    },
    {
        "match": "Qual seu nome",
        "answer": "Meu nome é Taeshi Bot"
    },

    // coloque mais objetos json
]
```

## Estrutura de pastas

- 📁 assets ➔ _arquivos de mídia_
    - 📁 auth ➔ _arquivos da conexão do bot_
    - 📁 images ➔ _arquivos de imagem_
    - 📁 temp ➔ _arquivos temporários_
- 📁 database ➔ _arquivos de dados_
- 📁 node_modules ➔ _módulos do Node.js_
- 📁 src ➔ _código fonte do bot (geralmente você mexerá mais aqui)_
    - 📁 commands ➔ _pasta onde ficam os comandos_
        - 📁 admin ➔ _pasta onde ficam os comandos administrativos_
        - 📁 member ➔ _pasta onde ficam os comandos gerais (todos poderão utilizar)_
        - 📁 owner ➔ _pasta onde ficam os comandos de dono (grupo e bot)_
        - 📝\_sample.js ➔ _arquivo de exemplo de como criar um comando_
    - 📁 errors ➔ _classes de erros usadas nos comandos_
    - 📁 middlewares ➔ _interceptadores de requisições_
    - 📁 services ➔ _serviços diversos_
    - 📁 utils ➔ _utilitários_
    - 📝 config.js ➔ _arquivo de configurações do Bot_
    - 📝 connection.js ➔ _script de conexão do Bot com a biblioteca Baileys_
    - 📝 index.js ➔ _script ponto de entrada do Bot_
    - 📝 loader.js ➔ _script de carga de funções_
    - 📝 test.js ➔ _script de testes_
- 📝.gitignore ➔ _arquivo para não subir certas pastas no GitHub_
- 📝LICENSE ➔ _arquivo de licença_
- 📝linux-start.sh ➔ _arquivo de inicialização do bot no Linux_
- 📝package-lock.json ➔ _arquivo de cache das dependências do Bot_
- 📝package.json ➔ _arquivo de definição das dependências do Bot_
- 📝README.md ➔ _esta documentação_
- 📝termux-start.sh ➔ _arquivo de inicialização do bot no Termux_

## Erros comuns

### Operação negada ao extrair a pasta

O erro abaixo acontece quando é feito o download do arquivo ZIP direto no celular em algumas versões do apk ZArchiver e também de celulares sem root.

Para resolver, siga o [tutorial de instalação via git clone](#termux-setup).

![erro comum 1](./assets/images/erro-comum-1.jpg)

## Inscreva-se no canal!

<a href="https://www.youtube.com/@devgui_?sub_confirmation=1" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube"></a>

## Licença

[MIT](https://github.com/guiireal/takeshi-bot/blob/main/LICENSE)

## ⚠ Disclaimer

Neste projeto, precisei hospedar a node_modules, para auxiliar quem está rodando o bot pelo celular, pois muitos deles podem não rodar o `npm install` pelo termux corretamente.
