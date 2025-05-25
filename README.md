# 🤖 Takeshi Bot

<div align="center">
    <img src="./assets/images/takeshi-bot.png" width="500">
</div>

<br />

<div align="center">
    <a href="https://github.com/guiireal/takeshi-bot">
        <img alt="Version" src="https://img.shields.io/badge/Vers%C3%A3o-4.0.0-blue">
    </a>
</div>

<br />

## Bot de WhatsApp multifunções, desenvolvido no vídeo:

[CRIANDO UM BOT DE WHATSAPP DO ZERO (GUIA DEFINITIVO) - BASE COMPLETA + 6 COMANDOS - JAVASCRIPT](https://youtu.be/6zr2NYIYIyc)

![Logger](./assets/images/logger.png)

## Tecnologias envolvidas

- [Axios](https://axios-http.com/ptbr/docs/intro)
- [Baileys 6.7.16](https://github.com/WhiskeySockets/Baileys)
- [FFMPEG](https://ffmpeg.org/)
- [Node.js >= 22.14.0](https://nodejs.org/en)
- [Spider X API](https://api.spiderx.com.br)

## ⚠ Atenção

Nós não prestamos suporte gratuíto caso você tenha adquirido esta base com terceiros e tenha pago por isso. 
Solicite que **a pessoa que te vendeu, forneça suporte**.
Nós não temos vínculo nenhum com terceiros e não nos responsabilizamos por isso, nem prestamos suporte nessas condições.

Caso seu bot seja o oficial da Bronxys, 
interaja conosco e receba suporte através do grupo:
[https://chat.whatsapp.com/CaOn8owxr4zICaLkZdtyDT](https://chat.whatsapp.com/CaOn8owxr4zICaLkZdtyDT)

## Instalação no Termux

1 - Abra o Termux e execute os comandos abaixo.<br/>
_Não tem o Termux? [Clique aqui e baixe a última versão](https://www.mediafire.com/file/082otphidepx7aq/Termux_0.119.1_aldebaran_dev.apk)._

```sh
pkg upgrade -y && pkg update -y && pkg install git -y && pkg install nodejs-lts -y && pkg install ffmpeg -y
```

2 - Habilite o acesso da pasta storage, no termux.

```sh
termux-setup-storage
```

3 - Entre na pasta sdcard.

```sh
cd /sdcard
```

4 - Clone o repositório.

```sh
git clone https://github.com/guiireal/takeshi-bot.git
```

5 - Entre na pasta que foi clonada.

```sh
cd takeshi-bot
```

6 - Habilite permissões de leitura e escrita (faça apenas 1x esse passo).

```sh
chmod -R 755 ./*
```

7 - Execute o bot.

```sh
npm start
```

8 - Insira o número de telefone e pressione `enter`.

9 - Informe o código que aparece no termux, no seu WhatsApp, [assista aqui, caso não encontre essa opção](https://youtu.be/6zr2NYIYIyc?t=5395).

10 - Aguarde 10 segundos, depois digite `CTRL + C` para parar o bot.

11 - Configure o arquivo `config.js` que está dentro da pasta `src`.

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

12 - Inicie o bot novamente.

```sh
npm start
```

## Instalação em VPS (Debian/Ubuntu)

1 - Abra um novo terminal e execute os seguintes comandos.

```sh
sudo apt update && sudo apt upgrade && sudo apt-get update && sudo apt-get upgrade && sudo apt install ffmpeg
```

2 - Instale o `curl` se não tiver.

```sh
sudo apt install curl
```

3 - Instale o `git` se não tiver.

```sh
sudo apt install git
```

4 - Instale o NVM.

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

5 - Atualize o source do seu ambiente

```sh
source ~/.bashrc
```

6 - Instale a versão 22 mais recente do node.js.

```sh
nvm install 22
```

7 - Verifique se a versão foi instalada e está ativa.

```sh
node -v # Deve exibir a versão 22
```

8 - Verifique se o npm foi instalado junto.

```sh
npm -v # Deverá exibir a versão do npm
```

9 - Instale o PM2 (recomendado).

```sh
npm install pm2 -g
```

10 - Clone o repositório do bot onde você desejar.

```sh
git clone https://github.com/guiireal/takeshi-bot.git
```

11 - Entre na pasta clonada.

```sh
cd takeshi-bot
```

12 - Digite o seguinte comando.

```sh
npm start
```

13 - O bot vai solicitar que você digite seu número de telefone.<br/>
Digite **exatamente** como está no WhatsApp e apenas números.

Não adicione o 9º dígito em números que não sejam de SP ou RJ.

![tutorial-vps-1](./assets/images/tutorial-vps-1.png)

14 - Conecte o bot no PM2

```sh
pm2 start npm --name "takeshi-bot" -- start
```
15 - O bot exibirá um **código de pareamento** que deve ser colocado em `dispositivos conectados` no seu WhatsApp.

![tutorial-vps-2](./assets/images/tutorial-vps-2.png)

16 - Vá em `dispositivos conectados` no seu WhatsApp.

![tutorial-vps-3](./assets/images/tutorial-vps-3.png)

17 - Clique em `conectar dispositivo`

![tutorial-vps-4](./assets/images/tutorial-vps-4.png)

18 - No canto inferior, clique em `Conectar com número de telefone`

![tutorial-vps-5](./assets/images/tutorial-vps-5.png)

19 - Coloque o **código de pareamento** que você recebeu no terminal, que foi feito no passo `15`.

![tutorial-vps-6](./assets/images/tutorial-vps-6.png)

20 - Após isso, no terminal que ficou parado, ele deve exibir que **foi conectado com sucesso**

![tutorial-vps-7](./assets/images/tutorial-vps-7.png)

21 - Digite `CTRL + C` para parar o bot.

22 - Agora inicie ele pelo `PM2`, executando o seguinte código abaixo.

```sh
pm2 start npm --name "takeshi-bot" -- start
```

![tutorial-vps-8](./assets/images/tutorial-vps-8.png)

23 - Configure o arquivo `config.js` que está dentro da pasta `src`.

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

24 - Por fim, teste o bot!

![tutorial-vps-9](./assets/images/tutorial-vps-9.png)

## Alguns comandos necessitam de API

Edite o arquivo `config.js` que está dentro da pasta `src` e cole sua api key da plataforma Spider X API, conforme o código abaixo.<br/>
Para obter seu token, acesse: [https://api.spiderx.com.br](https://api.spiderx.com.br) e crie sua conta gratuitamente!

```js
exports.SPIDER_API_TOKEN = "seu_token_aqui";
```

## Funcionalidades gerais

| Função | Online? | Contexto | Requer a Spider X API?
| ------------ | --- | --- | ---
| Desligar o bot no grupo | ✅ | Dono | ❌
| Ligar o bot no grupo | ✅ | Dono | ❌
| Obter o ID do grupo | ✅ | Dono | ❌
| Abrir grupo | ✅ | Admin | ❌
| Anti link | ✅ | Admin | ❌
| Banir membros | ✅ | Admin | ❌
| Fechar grupo | ✅ | Admin | ❌
| Ligar/desligar auto responder | ✅ | Admin | ❌
| Ligar/desligar boas vindas | ✅ | Admin | ❌
| Ligar/desligar saída de grupo | ✅ | Admin | ❌
| Limpar chat | ✅ | Admin | ❌
| Marcar todos | ✅ | Admin | ❌
| Mudar nome do grupo | ✅ | Admin | ❌
| Revelar | ✅ | Admin | ❌
| Busca CEP | ✅ | Membro | ❌
| Canvas Bolsonaro | ✅ | Membro | ✅
| Canvas cadeia | ✅ | Membro | ✅
| Canvas inverter | ✅ | Membro | ✅
| Canvas RIP | ✅ | Membro | ✅
| Comandos de diversão/brincadeiras | ✅ | Membro | ✅
| Figurinha de texto animada | ✅ | Membro | ✅
| Geração de imagens com IA | ✅ | Membro | ❌
| Google search | ✅ | Membro | ✅
| GPT 4 | ✅ | Membro | ✅
| Imagem IA PixArt | ✅ | Membro | ✅
| Imagem IA Stable Diffusion Turbo | ✅ | Membro | ✅
| Ping | ✅ | Membro | ❌
| Play áudio | ✅ | Membro | ✅
| Play vídeo | ✅ | Membro | ✅
| Sticker | ✅ | Membro | ❌
| Sticker IA | ✅ | Membro | ✅
| Sticker para imagem | ✅ | Membro | ❌
| TikTok video download | ✅ | Membro | ✅
| YT MP3 | ✅ | Membro | ✅
| YT MP4 | ✅ | Membro | ✅
| YT search | ✅ | Membro | ✅

## Funcionalidades de envio (Exemplos)

### 🎵 Exemplos de áudio

| Comando | Função | Descrição | Características |
|---------|---------|-----------|-----------------|
| `/enviar-audio-de-arquivo` | Enviar áudio de arquivo | Demonstra envio de arquivos de áudio do armazenamento local | Opção de mensagem de voz, resposta citada |
| `/enviar-audio-de-url` | Enviar áudio de URL | Demonstra envio de arquivos de áudio de URLs externas | Opção de mensagem de voz, resposta citada |
| `/enviar-audio-de-buffer` | Enviar áudio de buffer | Demonstra envio de arquivos de áudio de buffers de memória | Opção de mensagem de voz, resposta citada, buffer de arquivo ou URL |

### 🖼️ Exemplos de imagem

| Comando | Função | Descrição | Características |
|---------|---------|-----------|-----------------|
| `/enviar-imagem-de-arquivo` | Enviar imagem de arquivo | Demonstra envio de arquivos de imagem do armazenamento local | Suporte a legenda personalizada, menções, resposta citada |
| `/enviar-imagem-de-url` | Enviar imagem de URL | Demonstra envio de arquivos de imagem de URLs externas | Envio direto de URL, suporte a menções, resposta citada |
| `/enviar-imagem-de-buffer` | Enviar imagem de buffer | Demonstra envio de arquivos de imagem de buffers de memória | Buffer de arquivo ou URL, legenda opcional, menções, resposta citada |

### 🎬 Exemplos de vídeo

| Comando | Função | Descrição | Características |
|---------|---------|-----------|-----------------|
| `/enviar-video-de-arquivo` | Enviar vídeo de arquivo | Demonstra envio de arquivos de vídeo do armazenamento local | Suporte a legenda personalizada, menções, resposta citada |
| `/enviar-video-de-url` | Enviar vídeo de URL | Demonstra envio de arquivos de vídeo de URLs externas | Envio direto de URL, suporte a menções, resposta citada |
| `/enviar-video-de-buffer` | Enviar vídeo de buffer | Demonstra envio de arquivos de vídeo de buffers de memória | Buffer de arquivo ou URL, legenda opcional, menções, resposta citada |

### 🎞️ Exemplos de GIF

| Comando | Função | Descrição | Características |
|---------|---------|-----------|-----------------|
| `/enviar-gif-de-arquivo` | Enviar GIF de arquivo | Demonstra envio de arquivos GIF do armazenamento local | Suporte a legenda, menções, resposta citada |
| `/enviar-gif-de-url` | Enviar GIF de URL | Demonstra envio de arquivos GIF de URLs externas | Suporte a legenda, menções, resposta citada |
| `/enviar-gif-de-buffer` | Enviar GIF de buffer | Demonstra envio de arquivos GIF de buffers de memória | Buffer de arquivo ou URL, legenda, menções, resposta citada |

### 🎭 Exemplos de sticker

| Comando | Função | Descrição | Características |
|---------|---------|-----------|-----------------|
| `/enviar-sticker-de-arquivo` | Enviar sticker de arquivo | Demonstra envio de arquivos sticker do armazenamento local | Formato WebP |
| `/enviar-sticker-de-url` | Enviar sticker de URL | Demonstra envio de arquivos sticker de URLs externas | Formato WebP |
| `/enviar-sticker-de-buffer` | Enviar sticker de buffer | Demonstra envio de arquivos sticker de buffers de memória | Buffer de arquivo ou URL |

### 📊 Exemplos de enquete/votação

| Comando | Função | Descrição | Características |
|---------|---------|-----------|-----------------|
| `/enviar-enquete` | Enviar enquete | Demonstra como criar e enviar enquetes/votações em grupos | Suporte a escolha única ou múltipla escolha |

### 📄 Exemplos de documento

| Comando | Função | Descrição | Características |
|---------|---------|-----------|-----------------|
| `/enviar-documento-de-arquivo` | Enviar documento de arquivo | Demonstra envio de arquivos de documento do armazenamento local | Especificação de tipo MIME, nome de arquivo personalizado |
| `/enviar-documento-de-url` | Enviar documento de URL | Demonstra envio de arquivos de documento de URLs externas | Especificação de tipo MIME, nome de arquivo personalizado |
| `/enviar-documento-de-buffer` | Enviar documento de buffer | Demonstra envio de arquivos de documento de buffers de memória | Buffer de arquivo ou URL, tipo MIME, nome de arquivo personalizado |

### 💬 Exemplos de mensagem

| Comando | Função | Descrição | Características |
|---------|---------|-----------|-----------------|
| `/enviar-texto` | Enviar texto | Demonstra envio de mensagens de texto simples | Suporte a menções |
| `/enviar-resposta` | Enviar resposta | Demonstra envio de mensagens de resposta | Respostas de sucesso/erro/aviso |
| `/enviar-reacoes` | Enviar reações | Demonstra envio de emojis de reação | Várias reações emoji, reações de sucesso/erro/aviso |

### 📊 Exemplos de metadados

| Comando | Função | Descrição | Características |
|---------|---------|-----------|-----------------|
| `/obter-metadados-mensagem` | Obter metadados da mensagem | Demonstra extração avançada de metadados de mensagem ou mensagem citada | Análise detalhada, suporte a resposta de mensagens, informações técnicas, menções automáticas |
| `/obter-dados-grupo` | Obter dados do grupo | Demonstra extração de informações do grupo | Metadados do grupo, lista de participantes, informações de admin |
| `/funcoes-grupo` | Funções do grupo | Demonstra uso de funções utilitárias do grupo | Extração de nome, dono, admins, participantes do grupo |

### 🎯 Central de exemplos

| Comando | Função | Descrição | Características |
|---------|---------|-----------|-----------------|
| `/exemplos-baileys` | Central de exemplos | Central com lista de todos os exemplos disponíveis | Menu interativo, acesso direto a todos os exemplos |

## Auto responder

O Takeshi Bot possui um auto-responder embutido, edite o arquivo em `./database/auto-responder.json`:

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
        "answer": "Meu nome é Takeshi Bot"
    }
]
```

## Implementação técnica dos exemplos

### 📁 Localização dos comandos de exemplo
Todos os comandos de exemplo estão localizados em: `src/commands/member/exemplos/`

### 🛠️ Funções disponíveis
Todos os comandos de exemplo utilizam funções de `src/utils/loadCommonFunctions.js`:

#### Funções de áudio
- `sendAudioFromFile(filePath, asVoice, quoted)`
- `sendAudioFromURL(url, asVoice, quoted)`
- `sendAudioFromBuffer(buffer, asVoice, quoted)`

#### Funções de imagem
- `sendImageFromFile(filePath, caption, mentions, quoted)`
- `sendImageFromURL(url, caption, mentions, quoted)`
- `sendImageFromBuffer(buffer, caption, mentions, quoted)`

#### Funções de Vídeo
- `sendVideoFromFile(filePath, caption, mentions, quoted)`
- `sendVideoFromURL(url, caption, mentions, quoted)`
- `sendVideoFromBuffer(buffer, caption, mentions, quoted)`

#### Funções de GIF
- `sendGifFromFile(file, caption, mentions, quoted)`
- `sendGifFromURL(url, caption, mentions, quoted)`
- `sendGifFromBuffer(buffer, caption, mentions, quoted)`

#### Funções de sticker
- `sendStickerFromFile(filePath, quoted)`
- `sendStickerFromURL(url, quoted)`
- `sendStickerFromBuffer(buffer, quoted)`

#### Funções de documento
- `sendDocumentFromFile(filePath, mimetype, fileName, quoted)`
- `sendDocumentFromURL(url, mimetype, fileName, quoted)`
- `sendDocumentFromBuffer(buffer, mimetype, fileName, quoted)`

#### Funções de mensagem
- `sendText(text, mentions)`
- `sendReply(text)`
- `sendReact(emoji)`
- `sendSuccessReply(text)`, `sendErrorReply(text)`, `sendWarningReply(text)`
- `sendSuccessReact()`, `sendErrorReact()`, `sendWarningReact()`

#### Funções Utilitárias de Grupo
- `getGroupMetadata()` - Obter metadados completos do grupo
- `getGroupName()` - Obter apenas o nome do grupo
- `getGroupOwner()` - Obter informações do dono do grupo
- `getGroupParticipants()` - Obter todos os participantes do grupo
- `getGroupAdmins()` - Obter administradores do grupo

### 🎯 Exemplos de Uso com Menções

#### Enviar imagem com menções
```javascript
await sendImageFromFile("./assets/image.jpg", "Olá @5511999999999!", ["5511999999999@s.whatsapp.net"]);

await sendImageFromURL(
  "https://exemplo.com/imagem.png", 
  "Olá @5511999999999 e @5511888888888!", 
  ["5511999999999@s.whatsapp.net", "5511888888888@s.whatsapp.net"]
);
```

#### Enviar vídeo com menções
```javascript
await sendVideoFromFile("./assets/video.mp4", "Confira este vídeo @5511999999999!", ["5511999999999@s.whatsapp.net"]);

const buffer = fs.readFileSync("./video.mp4");
await sendVideoFromBuffer(
  buffer, 
  "Vídeo especial para @5511999999999 e @5511888888888!", 
  ["5511999999999@s.whatsapp.net", "5511888888888@s.whatsapp.net"]
);
```

#### Enviar GIF com menções
```javascript
await sendGifFromFile(
  "./assets/gif.mp4", 
  "Tá ai @5511999999999!", 
  ["5511999999999@s.whatsapp.net"]
);
```

### 🎯 Suporte TypeScript
Definições completas do TypeScript estão disponíveis em `src/@types/index.d.ts` com:
- Assinaturas de função detalhadas
- Descrições de parâmetros
- Exemplos de uso
- Especificações de tipo de retorno

### 📁 Arquivos de exemplo
Todos os arquivos de exemplo são armazenados em `assets/samples/`:
- `sample-audio.mp3` - Arquivo de áudio para teste
- `sample-document.pdf` - Documento PDF para teste
- `sample-document.txt` - Documento de texto para teste
- `sample-image.jpg` - Arquivo de imagem para teste
- `sample-sticker.webp` - Arquivo de sticker para teste
- `sample-video.mp4` - Arquivo de vídeo para teste

## Estrutura de pastas

- 📁 assets ➔ _arquivos de mídia_
    - 📁 auth ➔ _arquivos da conexão do bot_
    - 📁 images ➔ _arquivos de imagem_
        - 📁 funny ➔ _gifs de comandos de diversão_
    - 📁 samples ➔ _arquivos de exemplo para testes_
    - 📁 temp ➔ _arquivos temporários_
- 📁 database ➔ _arquivos de dados_
- 📁 node_modules ➔ _módulos do Node.js_
- 📁 src ➔ _código fonte do bot (geralmente você mexerá mais aqui)_
    - 📁 @types ➔ _pasta onde fica as definições de tipos_
    - 📁 commands ➔ _pasta onde ficam os comandos_
        - 📁 admin ➔ _pasta onde ficam os comandos administrativos_
        - 📁 member ➔ _pasta onde ficam os comandos gerais (todos poderão utilizar)_
            - 📁 exemplos ➔ _pasta com 24 comandos de exemplo_
        - 📁 owner ➔ _pasta onde ficam os comandos de dono (grupo e bot)_
        - 📝🤖-como-criar-comandos.js ➔ _arquivo de exemplo de como criar um comando_
    - 📁 errors ➔ _classes de erros usadas nos comandos_
    - 📁 middlewares ➔ _interceptadores de requisições_
    - 📁 services ➔ _serviços diversos_
    - 📁 utils ➔ _utilitários_
    - 📝 config.js ➔ _arquivo de configurações do Bot_
    - 📝 connection.js ➔ _script de conexão do Bot com a biblioteca Baileys_
    - 📝 index.js ➔ _script ponto de entrada do Bot_
    - 📝 loader.js ➔ _script de carga de funções_
    - 📝 test.js ➔ _script de testes_
- ⚡-cases-estao-aqui ➔ _easter egg_ 
- 📝 index.js ➔ _script ponto de entrada do Bot para hospedagem_
- 📝.gitignore ➔ _arquivo para não subir certas pastas no GitHub_
- 📝LICENSE ➔ _arquivo de licença_
- 📝package-lock.json ➔ _arquivo de cache das dependências do Bot_
- 📝package.json ➔ _arquivo de definição das dependências do Bot_
- 📝README.md ➔ _esta documentação_

## Erros comuns

### Operação negada ao extrair a pasta

O erro abaixo acontece quando é feito o download do arquivo ZIP direto no celular em algumas versões do apk ZArchiver e também de celulares sem root.

Para resolver, siga o [tutorial de instalação via git clone](#termux-new-setup).

![erro comum 1](./assets/images/erro-comum-1.jpg)

### Remoção dos arquivos de sessão e conectar novamente

Caso dê algum erro na conexão, você pode apagar os arquivos dentro da pasta `/assets/auth/baileys`.

```sh
rm -rf ./asset/auth/baileys
```

Depois, remova o dispositivo do WhatsApp indo nas configurações do WhatsApp em "dispositivos conectados".

Adicione novamente um novo dispositivo.

### Permission denied (permissão negada) ao acessar `cd /sdcard`

<br/>

![erro comum 2](./assets/images/erro-comum-2.png)

Abra o termux, digite `termux-setup-storage` e depois, aceite as permissões

## Inscreva-se no canal!

<a href="https://www.youtube.com/@devgui_?sub_confirmation=1" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="YouTube"></a>

## Licença

[GPL-3.0](https://github.com/guiireal/takeshi-bot/blob/main/LICENSE)

Este projeto está licenciado sob a Licença Pública Geral GNU (GPL-3.0).<br/>
Isso significa que:

- Você pode usar este código como quiser, seja para projetos pessoais ou comerciais.
- Você pode modificar o código para adaptá-lo às suas necessidades.
- Você pode compartilhar ou vender o código, mesmo modificado, mas precisa:
    - Manter os créditos ao autor original (Guilherme França - Dev Gui).
    - Tornar o código modificado disponível sob a mesma licença GPL-3.0.

O que você não pode fazer:

- Não pode transformar este código em algo proprietário (fechado) e impedir outras pessoas de acessá-lo ou usá-lo.

Esta licença garante que todos tenham acesso ao código-fonte e podem colaborar livremente, promovendo o compartilhamento e o aprimoramento do projeto.

## ⚠ Disclaimer

Neste projeto, precisei hospedar a node_modules, para auxiliar quem está rodando o bot pelo celular, pois muitos deles podem não rodar o `npm install` pelo termux corretamente.