# 🤖 Takeshi Bot

![Takeshi Bot](./assets/images/takeshi-bot.png)

[![Version](https://img.shields.io/badge/Vers%C3%A3o-7.9.0-blue)](https://github.com/guiireal/takeshi-bot)
[![Tests](https://github.com/guiireal/takeshi-bot-private/actions/workflows/test.yml/badge.svg)](https://github.com/guiireal/takeshi-bot-private/actions/workflows/test.yml)

> Base para bots de WhatsApp multifuncional com diversos comandos prontos.

[![Node.js](https://img.shields.io/badge/Node.js-22.22-green?logo=node.js)](https://nodejs.org/en)
[![Axios](https://img.shields.io/badge/Axios-1.14-blue?logo=axios)](https://axios-http.com/ptbr/docs/intro)
[![Baileys](https://img.shields.io/badge/Baileys-7.0.0.9-purple?logo=whatsapp)](https://github.com/WhiskeySockets/Baileys)
[![FFMPEG](https://img.shields.io/badge/FFMPEG-Latest-orange?logo=ffmpeg)](https://ffmpeg.org/)
[![Spider X API](https://img.shields.io/badge/Spider_X-API-green?logo=api)](https://api.spiderx.com.br)

## Desenvolvida do zero, no vídeo

[CRIANDO UM BOT DE WHATSAPP DO ZERO (GUIA DEFINITIVO) - BASE COMPLETA + 6 COMANDOS - JAVASCRIPT](https://youtu.be/6zr2NYIYIyc)

![Logger](./assets/images/logger.png)

## 📋 Sumário

1. [🌐 Idiomas Disponíveis](#-acesse-o-takeshi-bot-em-outros-idiomas)
2. [⚠️ Atenção](#-atenção)
3. [📖 Sobre o Projeto](#sobre-este-projeto)
4. [🚀 Instalação](#instalação-no-termux)
    - [No Termux](#instalação-no-termux)
    - [Nas principais hosts do Brasil](#instalação-nas-principais-hosts-do-brasil)
    - [Em VPS (Debian/Ubuntu)](#instalação-em-vps-debianubuntu)
5. [📊 Diagrama de conexão](#diagrama-de-conexão)
6. [⚙️ Alguns comandos necessitam de API](#alguns-comandos-necessitam-de-api)
7. [🛠️ Funcionalidades](#funcionalidades-gerais)
    - [Funcionalidades gerais](#funcionalidades-gerais)
    - [Funcionalidades de envio (Exemplos)](#funcionalidades-de-envio-exemplos)
8. [🤖 Auto responder](#auto-responder)
    - [Menu do bot](#onde-fica-o-menu-do-bot)
    - [Mensagens de boas vindas](#onde-modifico-a-mensagem-de-boas-vindas-e-quando-alguém-sai-do-grupo)
9. [📊 Diagrama de como os comandos funcionam](#diagrama-de-como-os-comandos-funcionam)
10. [📊 Diagrama de como funcionam os middlewares](#diagrama-de-como-funcionam-os-middlewares-interceptadores-de-recepção-e-saída)
11. [💻 Custom Middleware - Personalize o bot sem modificar arquivos principais](#custom-middleware---personalize-o-bot-sem-modificar-arquivos-principais)
12. [🛠️ Implementação técnica dos exemplos](#implementação-técnica-dos-exemplos)
13. [📁 Estrutura de pastas](#estrutura-de-pastas)
14. [🔄 Atualizar o bot](#atualizar-o-bot)
15. [🧪 Testes](#testes)
16. [❓ Erros comuns](#erros-comuns)
17. [📺 Inscreva-se no canal](#inscreva-se-no-canal)
18. [🤝 Contribuindo com o projeto](#contribuindo-com-o-projeto)
19. [⚖️ Licença e Disclaimer](#licença)

## 🌐 Acesse o Takeshi Bot em outros idiomas

- 🇪🇸 [**Versión en Español**](https://github.com/guiireal/takeshi-bot-espanol)

## ⚠ Atenção

Nós não prestamos suporte gratuíto caso você tenha adquirido esta base com terceiros e tenha pago por isso.
Este bot sempre foi e sempre será **gratuíto**.
Caso você tenha pago para utilizar este bot, do jeito que ele está hoje, saiba que você **foi enganado**.
Nós não temos vínculo nenhum com terceiros e não nos responsabilizamos por isso, também não prestamos suporte nessas condições.
Os únicos recursos pagos deste bot são pertencentes à [https://api.spiderx.com.br](https://api.spiderx.com.br), nossa API oficial.

## Sobre este projeto

Este projeto não possui qualquer vínculo oficial com o WhatsApp. Ele foi desenvolvido de forma independente para interações automatizadas por meio da plataforma.

Não nos responsabilizamos por qualquer uso indevido deste bot. É de responsabilidade exclusiva do usuário garantir que sua utilização esteja em conformidade com os termos de uso do WhatsApp e a legislação vigente.

## Instalação no Termux

1 - Abra o Termux e execute os comandos abaixo.
_Não tem o Termux? [Clique aqui e baixe a última versão](https://www.mediafire.com/file/wxpygdb9bcb5npb/Termux_0.118.3_Dev_Gui.apk) ou [clique aqui e baixe versão da Play Store](https://play.google.com/store/apps/details?id=com.termux) caso a versão do MediaFire anterior não funcione._

```sh
pkg upgrade -y && pkg update -y && pkg install git -y && pkg install nodejs-lts -y && pkg install ffmpeg -y
```

2 - Habilite o acesso da pasta storage, no termux.

```sh
termux-setup-storage
```

3 - Escolha uma pasta de sua preferência pra colocar os arquivos do bot.

Pastas mais utilizadas:

- /sdcard
- /storage/emulated/0
- /storage/emulated/0/Download (muito comum quando você baixa o bot pelo .zip)

No nosso exemplo, vamos para a `/sdcard`

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

Depois, Configure o arquivo `config.js` que está dentro da pasta `src`.

```js
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
```

11 - Inicie o bot novamente.

```sh
npm start
```

## Instalação nas principais hosts do Brasil

As principais hosts já oferecem o Takeshi como **bot padrão**, não sendo necessário nenhuma instalação manual!

**Hosts suportadas**:

| Bronxys | NexFuture | Speed Cloud |
|---------|-----------|-------------|
| [Grupo oficial](https://chat.whatsapp.com/EbouYvvcPiN4owPSdR9gZO) | [Grupo oficial](https://chat.whatsapp.com/Fl5FzZQC00J5CZp07AZVwQ?mode=r_c) | [Grupo oficial](https://chat.whatsapp.com/HsZDn6DJrx34z5lbNbNB2M) |
| [![Bronxys](./assets/images/bronxys.png)](https://bronxyshost.com/) | [![NexFuture](./assets/images/nexfuture.png)](https://nexfuture.com.br/) | [![Speed Cloud](./assets/images/speed-cloud.png)](https://speedhosting.cloud/) |

| TED Host | Nodz Host | Cebolinha Host |
|----------|-----------|----------------|
| [Grupo oficial](https://chat.whatsapp.com/DVDE1TCtHrKFatUKrlepjZ) | [Grupo oficial](https://chat.whatsapp.com/I5d5tCyZsV4J7Cjn51IkbV) | [Grupo oficial](https://chat.whatsapp.com/CCf2Pw9guan12orwGg0TqC?mode=gi_t) |
| [![TED Host](./assets/images/ted-host.png)](https://loja.tedhost.com.br/) | [![Nodz Host](./assets/images/nodz.png)](loja.nodzhostinger.com.br) | [![Cebolinha Host](./assets/images/cebolinha-host.jpeg)](https://chat.whatsapp.com/CCf2Pw9guan12orwGg0TqC?mode=gi_t) |

| Raikken | Imperio Cloud |
|---------|---------------|
| [Grupo oficial](https://chat.whatsapp.com/BzSDYUHbjHGF6gQmJfh2C7?mode=gi_t) | [Grupo oficial](https://chat.whatsapp.com/I145pqIkE6HCMlfg7Lw0ix?mode=gi_t) |
| [![Raikken](./assets/images/raikken-host.png)](https://painel.raikken.com.br) | [![Imperio Cloud](./assets/images/imperio-cloud.png)](https://dash.imperiocloud.com.br) |

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

13 - O bot vai solicitar que você digite seu número de telefone.
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

23 - Aguarde 10 segundos, depois digite `CTRL + C` para parar o bot.

Depois, Configure o arquivo `config.js` que está dentro da pasta `src`.

```js
// Prefixo padrão dos comandos.
export const PREFIX = "/";

// Emoji do bot (mude se preferir).
export const BOT_EMOJI = "🤖";

// Nome do bot (mude se preferir).
export const BOT_NAME = "Takeshi Bot";

// LID do bot (no caso, o que você rodará o bot).
// Para obter o LID do bot, use o comando <prefixo>lid respondendo em cima de uma mensagem do número do bot
// Troque o <prefixo> pelo prefixo do bot (ex: /lid).
export const BOT_LID = "12345678901234567890@lid";

// LID do dono do bot (no caso, o seu!).
// Para obter o LID do dono do bot, use o comando <prefixo>meu-lid
// Troque o <prefixo> pelo prefixo do bot (ex: /meu-lid).
export const OWNER_LID = "12345678901234567890@lid";
```

Lembre-se de trocar os números acima pelos seus números, obviamente e tbm ver se o seu prefixo é a barra /.

24 - Por fim, teste o bot!

![tutorial-vps-9](./assets/images/tutorial-vps-9.png)

## Diagrama de conexão

[![diagram](https://mermaid.ink/img/pako:eNqdVc1u1DAQfpWpJSSQtqX7k_2JoChse-hh26qtWlTtxZtMs4bEXhxnVVpV4gDcOLQUDgipQnBAiBs3OO6b8AR9BMbJZvu3BYQPVmx_M558M9_4gPkqQOayBJ-mKH1cFDzUPO5KoMFTo2Qa91Dn6wHXRvhiwKWBRRwCT-Ds9OjLr-evz06Pf8KW8kdfryMfKpMjP7-DTf4Ek76we9eB216OO_4G231uEm8w6MoctqIMghqitveWtj2XYO-fQ1vFCtTEq68k-oaDVBMHDwoPt27B_cmAtfXlztLyugdbSzsX9nOoJiegw97tSnW-BJWanRznTn54UzSv3sKaFjEKzWGI-6BVwGVgo-sV_2rH-ReZzi4sEBEuyEEMiSEmzk9pn04J40KXLYpQ2BtBjn7EqBUEmVd7NNWf45TLrWJMuzv3bgNfwwDBH30PREhu0eYDeYzSqHP0tjdbeF5Ho7TkE4vbuOdCuVKtzTr1RvPO1PjPTk-OoKMSoyd2F2ymhXeJXxe8Hlmep9Sm18cojbi-19N3F7ZGHwFj4sKzwUd9lVBdZIUQqKTLMkw7ElTfOWx8qKHAjzETloufi7OYA3Vz9iyDvz68hPbYggpwV-iYbC4EeYnIMY82hr3RJ5VJTIt9HvCZq-RlwA0eDYk2TWmSvuAi-TNfmY2N6OHqJrRXV5bam97i6kz2f16oiEeMEIZ8opWcQhtFzEmIWeoREowHGvMLUAY3aWj05tFyx9uwIlra-IOMxgrKtPQXGZ28gBVqAgM9-r4nYvoiLWHyv_rJueZaY3iJREgsrck0QYyrA65QMlUNWeqLUpv5x8ysra-ubI5TYlvjY1u-iaFZyUhIzA4QeJhynbcQCiDhIU0XEgJTByuxUIuAuUanWGLUK2Jul-zAWnSZ6WOMXWYbR4C7PI2M7SCHZEYNeEepuLDUKg37zN3lUUKrdBBwUzwNk11NgaBuq1Qa5pZbzUrmhbkHbI_WzfpcrdGq1eabTtNpVSrVEnvG3Mb8XKPpVKpVakx1p1FvHpbYfnZvea5RL9drjfK8UynXW80Sw0CQNjr5-5Q9U4e_ARz-Fnw?type=png)](https://mermaid.live/edit#pako:eNqdVc1u1DAQfpWpJSSQtqX7k_2JoChse-hh26qtWlTtxZtMs4bEXhxnVVpV4gDcOLQUDgipQnBAiBs3OO6b8AR9BMbJZvu3BYQPVmx_M558M9_4gPkqQOayBJ-mKH1cFDzUPO5KoMFTo2Qa91Dn6wHXRvhiwKWBRRwCT-Ds9OjLr-evz06Pf8KW8kdfryMfKpMjP7-DTf4Ek76we9eB216OO_4G231uEm8w6MoctqIMghqitveWtj2XYO-fQ1vFCtTEq68k-oaDVBMHDwoPt27B_cmAtfXlztLyugdbSzsX9nOoJiegw97tSnW-BJWanRznTn54UzSv3sKaFjEKzWGI-6BVwGVgo-sV_2rH-ReZzi4sEBEuyEEMiSEmzk9pn04J40KXLYpQ2BtBjn7EqBUEmVd7NNWf45TLrWJMuzv3bgNfwwDBH30PREhu0eYDeYzSqHP0tjdbeF5Ho7TkE4vbuOdCuVKtzTr1RvPO1PjPTk-OoKMSoyd2F2ymhXeJXxe8Hlmep9Sm18cojbi-19N3F7ZGHwFj4sKzwUd9lVBdZIUQqKTLMkw7ElTfOWx8qKHAjzETloufi7OYA3Vz9iyDvz68hPbYggpwV-iYbC4EeYnIMY82hr3RJ5VJTIt9HvCZq-RlwA0eDYk2TWmSvuAi-TNfmY2N6OHqJrRXV5bam97i6kz2f16oiEeMEIZ8opWcQhtFzEmIWeoREowHGvMLUAY3aWj05tFyx9uwIlra-IOMxgrKtPQXGZ28gBVqAgM9-r4nYvoiLWHyv_rJueZaY3iJREgsrck0QYyrA65QMlUNWeqLUpv5x8ysra-ubI5TYlvjY1u-iaFZyUhIzA4QeJhynbcQCiDhIU0XEgJTByuxUIuAuUanWGLUK2Jul-zAWnSZ6WOMXWYbR4C7PI2M7SCHZEYNeEepuLDUKg37zN3lUUKrdBBwUzwNk11NgaBuq1Qa5pZbzUrmhbkHbI_WzfpcrdGq1eabTtNpVSrVEnvG3Mb8XKPpVKpVakx1p1FvHpbYfnZvea5RL9drjfK8UynXW80Sw0CQNjr5-5Q9U4e_ARz-Fnw)

## Alguns comandos necessitam de API

Edite o arquivo `config.js` que está dentro da pasta `src` e cole sua api key da plataforma Spider X API, conforme o código abaixo.
Para obter seu token, acesse: [https://api.spiderx.com.br](https://api.spiderx.com.br) e crie sua conta gratuitamente!

```js
export const SPIDER_API_TOKEN = "seu_token_aqui";
```

Para comandos de **canvas** e **gerar-link**, é necessário configurar a API do **Linker**:

```js
export const LINKER_BASE_URL = "https://linker.devgui.dev/api";
export const LINKER_API_KEY = "seu_token_aqui";
```

Obtenha sua API Key em: [https://linker.devgui.dev](https://linker.devgui.dev)

## Funcionalidades gerais

| Função | Contexto | Requer a Spider X API? |
| ------------ | --- | --- |
| Alterar imagem do bot | Dono | ❌ |
| Desligar o bot no grupo | Dono | ❌ |
| Executar comandos de infra | Dono | ❌ |
| Ligar o bot no grupo | Dono | ❌ |
| Modificar o prefixo por grupo | Dono | ❌ |
| Obter o ID do grupo | Dono | ❌ |
| Abrir grupo | Admin | ❌ |
| Advertir | Admin | ❌ |
| Agendar mensagem | Admin | ❌ |
| Anti audio | Admin | ❌ |
| Anti documento | Admin | ❌ |
| Anti evento | Admin | ❌ |
| Anti imagem | Admin | ❌ |
| Anti link | Admin | ❌ |
| Anti produto | Admin | ❌ |
| Anti sticker | Admin | ❌ |
| Anti video | Admin | ❌ |
| Banir membros | Admin | ❌ |
| Bloquear número no WhatsApp | Admin | ❌ |
| Excluir mensagens | Admin | ❌ |
| Fechar grupo | Admin | ❌ |
| Gestão de mensagens do auto-responder | Admin | ❌ |
| Ligar/desligar auto responder | Admin | ❌ |
| Ligar/desligar boas vindas | Admin | ❌ |
| Ligar/desligar saída de grupo | Admin | ❌ |
| Limpar chat | Admin | ❌ |
| Marcar todos | Admin | ❌ |
| Mudar nome do grupo | Admin | ❌ |
| Mute/unmute | Admin | ❌ |
| Obter o link do grupo | Admin | ❌ |
| Reativar advertência | Admin | ❌ |
| Remover advertência | Admin | ❌ |
| Revelar | Admin | ❌ |
| Somente admins | Admin | ❌ |
| Ver saldo | Admin | ❌ |
| Borrar imagem | Membro | ❌ |
| Brat (imagem com texto) | Membro | ✅ |
| Busca CEP | Membro | ❌ |
| Canvas Bolsonaro | Membro | ✅ |
| Canvas cadeia | Membro | ✅ |
| Canvas inverter | Membro | ✅ |
| Canvas RIP | Membro | ✅ |
| Comandos de diversão/brincadeiras | Membro |❌ |
| Espelhar imagem | Membro | ❌ |
| Facebook download | Membro | ✅ |
| Fake chat | Membro | ❌ |
| Figurinha animada para GIF | Membro | ✅ |
| Figurinha de texto animada | Membro | ✅ |
| Geração de imagens com IA | Membro | ✅ |
| Gerar link | Membro | ❌ |
| Google Gemini | Membro | ✅ |
| Google search | Membro | ✅ |
| GPT-5 Mini | Membro | ✅ |
| Imagem com contraste | Membro | ❌ |
| Imagem IA Flux | Membro | ✅ |
| Imagem pixelada | Membro | ❌ |
| Imagem preto/branco | Membro | ❌ |
| Informações de um comando | Membro | ❌ |
| Instagram download | Membro | ✅ |
| Pinterest download (carrossel) | Membro | ✅ |
| Ping | Membro | ❌ |
| Play áudio | Membro | ✅ |
| Play vídeo | Membro | ✅ |
| Renomear figurinha | Membro | ❌ |
| Sticker | Membro | ❌ |
| Sticker IA  | Membro | ✅ |
| Sticker para imagem | Membro | ❌ |
| TikTok video download | Membro | ✅ |
| YT MP3 | Membro | ✅ |
| YT MP4 | Membro | ✅ |
| YT search | Membro | ✅ |

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
|---------|--------|-----------|-----------------|
| `/enviar-sticker-de-arquivo` | Enviar sticker de arquivo | Demonstra envio de arquivos sticker do armazenamento local | Formato WebP |
| `/enviar-sticker-de-url` | Enviar sticker de URL | Demonstra envio de arquivos sticker de URLs externas | Formato WebP |
| `/enviar-sticker-de-buffer` | Enviar sticker de buffer | Demonstra envio de arquivos sticker de buffers de memória | Buffer de arquivo ou URL |

### 📊 Exemplos de enquete/votação

| Comando | Função | Descrição | Características |
|---------|--------|-----------|-----------------|
| `/enviar-enquete` | Enviar enquete | Demonstra como criar e enviar enquetes/votações em grupos | Suporte a escolha única ou múltipla escolha |

### 📍 Exemplos de localização

| Comando | Função | Descrição | Características |
|---------|---------|-----------|-----------------|
| `/enviar-localizacao` | Enviar localização | Demonstra como enviar localizações, com latitude e longitude | Suporte a latitude e longitude de qualquer lugar do mundo |

### 📲 Exemplos de contatos

| Comando | Função | Descrição | Características |
|---------|---------|-----------|-----------------|
| `/enviar-contato` | Enviar contato | Demonstra como enviar contatos | Os contatos podem ser chamados ou adicionados à lista dos seus contatos |

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
| `/enviar-mensagem-editada` | Enviar mensagem editada | Demonstra envio de mensagens editadas | Pode editar mensagens enviadas de forma direta ou respondendo alguém |

### 📊 Exemplos de metadados

| Comando | Função | Descrição | Características |
|---------|---------|-----------|-----------------|
| `/obter-metadados-mensagem` | Obter metadados da mensagem | Demonstra extração avançada de metadados de mensagem ou mensagem citada | Análise detalhada, suporte a resposta de mensagens, informações técnicas, menções automáticas |
| `/obter-dados-grupo` | Obter dados do grupo | Demonstra extração de informações do grupo | Metadados do grupo, lista de participantes, informações de admin |
| `/funcoes-grupo` | Funções do grupo | Demonstra uso de funções utilitárias do grupo | Extração de nome, dono, admins, participantes do grupo |

### 🎯 Central de exemplos

| Comando | Função | Descrição | Características |
|---------|---------|-----------|-----------------|
| `/exemplos-de-mensagens` | Central de exemplos | Central com lista de todos os exemplos disponíveis | Menu interativo, acesso direto a todos os exemplos |

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

## Auto figurinha / Auto sticker

O Takeshi Bot possui um recurso de auto-figurinha que converte automaticamente imagens e vídeos enviados em figurinhas:

| Comando | Função | Descrição |
|---------|---------|-----------|
| `/auto-stick 1` | Ativar | Ativa a conversão automática no grupo |
| `/auto-stick 0` | Desativar | Desativa a conversão automática no grupo |

**Nota:** O recurso suporta imagens e vídeos de até 10 segundos.

## Onde fica o menu do bot?

O menu do bot fica dentro da pasta `src` no arquivo chamado `menu.js`

## Onde modifico a mensagem de boas vindas e quando alguém sai do grupo?

As mensagens ficam dentro da pasta `src` no arquivo chamado `messages.js`

## Diagrama de como os comandos funcionam

[![diagram](https://mermaid.ink/img/pako:eNqNVltrG0cU_isnCwGJqJJ2tZKtpTE4GwUMteVYlinFL6Pd0Xpb7Y48F9eJMeRCX_pSSqEPJRDSBAp9K6HQ9_0n_gPtT-iZ2YscW7KiBzGz831nznduuxdWwEJqeZagp4qmAX0ck4iT5DgF_BElWaqSCeX5fk64jIN4TlIJY0E5EAH_vf35A25U9o7H7DbsEZM56sOvcEi-o-Ik1s9uA_0kzIG_vIJtfqriMwYhA58lJA3RcM7YY5ICO8Or9f0NJHlI-e0FPB1v7z0ewtHQz36EXVxvw3gX_KFeDkv2_fvwsPrBeDTOXh7sDGGwd7Szfe0kB3MaSODRpOZ02g1wXP3X7dbzwyW-oCoP7H__-enq9fsqIEDTs5hAUKoouZrxxdaW4bQSmqplZs2pDiC6QicUCCBSkIgW6aFpuFzZo-Eh7B8M_cFodJeuQpIRV1_pgFNI0o7gw3gaBwQozDkLFCfAbotbrJBTqjwqqQKNQ8TVHIMjZPYOiMRcfwZnzuk0Pi9ZAeOcSga1Vn0pd_-mf3BsmUBbyxy9GXQltMjE-3LCW1tYky9B8KCFlrQp0WLfp5S3VhySMInTVYcJ1e3UWhOsqzc_wCANWCo5Ux4UJO1-81uxNlRnLMj-BEkTmFOexEJk79lniN6vwDAhgpKQQEqwR4UkeRyuXvwOuXJ4CCL7iP2ZmiadMFkBcvUIMAuhj02yK0AhBhGnisxw6nBQ6wq66GMYfD3wx4d31bQp564u7M7Kms7HRqeo68E5DZTUhUIWY2dtTRsT_glJTFN-mpZl1xr8sLqi4JSdLVWo6xvzzRahFhiOAzqfPYOamSIc0WLOMB31TzA7CY6EChPrXbJAEB4JqOG_wjslE9fULUAUEhIL6LYfwFSl2R_Z31Tk_hBxb5kwlFMG4avsY6QLb2HXqPNWRsFugk-weSNSOAsFxbjjNGFX34v5kPRcGqOlYWEQnSb2hp6qBftBDlztpqnuKlJPOEuexDNay-mNnF1fU4EHg9H-cHS49jVh6u-O0tOD3wP32kw1SU1DerPCciROkL8KuXmQVr1_8qFxZFq_el-UBXOvUmc1rIjHoeVJrmgDJyLHzOPWutCQY0ue0IQeWx4uQzolaib1wLxEGr6lv2EsKZk4mKITy5uSmcCdmodElh8P1VOOF1LuM5VKy3PaTs9YsbwL6xz3bq_Z6fW7tuM6G92O7XQb1jPLs-1e0-72-z27t9F3Hdu-bFjPzb120-1vbvZdt9tpu5sbbbRGw1gyvpt_wpgvmcv_AYwQ1RY?type=png)](https://mermaid.live/edit#pako:eNqNVltrG0cU_isnCwGJqJJ2tZKtpTE4GwUMteVYlinFL6Pd0Xpb7Y48F9eJMeRCX_pSSqEPJRDSBAp9K6HQ9_0n_gPtT-iZ2YscW7KiBzGz831nznduuxdWwEJqeZagp4qmAX0ck4iT5DgF_BElWaqSCeX5fk64jIN4TlIJY0E5EAH_vf35A25U9o7H7DbsEZM56sOvcEi-o-Ik1s9uA_0kzIG_vIJtfqriMwYhA58lJA3RcM7YY5ICO8Or9f0NJHlI-e0FPB1v7z0ewtHQz36EXVxvw3gX_KFeDkv2_fvwsPrBeDTOXh7sDGGwd7Szfe0kB3MaSODRpOZ02g1wXP3X7dbzwyW-oCoP7H__-enq9fsqIEDTs5hAUKoouZrxxdaW4bQSmqplZs2pDiC6QicUCCBSkIgW6aFpuFzZo-Eh7B8M_cFodJeuQpIRV1_pgFNI0o7gw3gaBwQozDkLFCfAbotbrJBTqjwqqQKNQ8TVHIMjZPYOiMRcfwZnzuk0Pi9ZAeOcSga1Vn0pd_-mf3BsmUBbyxy9GXQltMjE-3LCW1tYky9B8KCFlrQp0WLfp5S3VhySMInTVYcJ1e3UWhOsqzc_wCANWCo5Ux4UJO1-81uxNlRnLMj-BEkTmFOexEJk79lniN6vwDAhgpKQQEqwR4UkeRyuXvwOuXJ4CCL7iP2ZmiadMFkBcvUIMAuhj02yK0AhBhGnisxw6nBQ6wq66GMYfD3wx4d31bQp564u7M7Kms7HRqeo68E5DZTUhUIWY2dtTRsT_glJTFN-mpZl1xr8sLqi4JSdLVWo6xvzzRahFhiOAzqfPYOamSIc0WLOMB31TzA7CY6EChPrXbJAEB4JqOG_wjslE9fULUAUEhIL6LYfwFSl2R_Z31Tk_hBxb5kwlFMG4avsY6QLb2HXqPNWRsFugk-weSNSOAsFxbjjNGFX34v5kPRcGqOlYWEQnSb2hp6qBftBDlztpqnuKlJPOEuexDNay-mNnF1fU4EHg9H-cHS49jVh6u-O0tOD3wP32kw1SU1DerPCciROkL8KuXmQVr1_8qFxZFq_el-UBXOvUmc1rIjHoeVJrmgDJyLHzOPWutCQY0ue0IQeWx4uQzolaib1wLxEGr6lv2EsKZk4mKITy5uSmcCdmodElh8P1VOOF1LuM5VKy3PaTs9YsbwL6xz3bq_Z6fW7tuM6G92O7XQb1jPLs-1e0-72-z27t9F3Hdu-bFjPzb120-1vbvZdt9tpu5sbbbRGw1gyvpt_wpgvmcv_AYwQ1RY)

## Diagrama de como funcionam os middlewares (interceptadores) de recepção e saída

[![diagram](https://mermaid.ink/img/pako:eNqtld9qE0EUxl_lOFBoIW2TzV8WrU2tFKVJa9uAltycZE_TwexMnJ2NtaXghQqiIPXCC1FELIgXeq3XeZO-gD6Cs7NJtmmTBsG9CDsz5zvn7De_yRyxpvSIuSygRyGJJq1ybCn06wLMg6GWIvQbpOJxB5XmTd5BoaHs-VwABvDn08mPeHQ5aEXqOOT0HezgQwr2eTR3ObAWkOonO4Wq7EqokN9Qst5PWpWaQHZNkK2UiuJdE_3-KdyrlaurG1BeX6v1XlbgdnVnqwwbNdgu3wEzv7ZV29wYpJmZgRvD54IkWYhjFTU1qFZj1smmU-Dkop98fi5enNzT2YfnUG63wt43H0hohSAktFTYkYkyebPK-aUlY4prBsYOKRCW78reFwl4SWjCBsGrpE2DCGbbAM_Vk-G4OueEKxKD-S4XnrGbAt37DKh5Fz28eb2hFpdmm9JH4UkXFh9T2wzMN4q5cTmxrUeS9dMkARcKb1ILwScRYIt88AgaiXhUlDhrhdthI9Bch9y1HR4J09QxnL14C9aneNI6Fc9Wo6a9S-Yl7QzoOXkFdbZCvm1CwqjrcP_B7rU6m9RZstsWV9_iGkFDDRp-ZSKmdkAjbnkUjDXswrefPfv1--cbqEad7eEhiBEBCS8e2JerGI9Ow2TC-3BbzKcT_vH1kPAA-RinJ_C9Rb5JBssVVBzHyKbQbWpNY7tyjq4Ae989nII4HXB9Fd9jEv4z5manO-TxKRs9GXJr179Dbq0fUh57Hlk4FEWAT-a7L48AX7PRfbSF1HyPN7H31SB5ge8xbv1fzCdu_Dr3O6YYejI6WecsmzVtUdtigF2zL6E2mVNAujk3PDnAUqyluMdcrUJKMZ-Uj9GQHUUxdab3yac6c82rR3sYtnXk27GRmctrV0p_oDT_vq195u6hcSPFwo6HenCjDmeVqUjqlgyFZq6TLuVsFuYesQPmZorFhYKTzWSK6Wwpn8s4ZvUJc-cLhYVizsmWSvlC2kk72exxih3awpmFfM4pFLJ5s54pFfMpZljTUlXie91e78d_AUVrgqU?type=png)](https://mermaid.live/edit#pako:eNqtld9qE0EUxl_lOFBoIW2TzV8WrU2tFKVJa9uAltycZE_TwexMnJ2NtaXghQqiIPXCC1FELIgXeq3XeZO-gD6Cs7NJtmmTBsG9CDsz5zvn7De_yRyxpvSIuSygRyGJJq1ybCn06wLMg6GWIvQbpOJxB5XmTd5BoaHs-VwABvDn08mPeHQ5aEXqOOT0HezgQwr2eTR3ObAWkOonO4Wq7EqokN9Qst5PWpWaQHZNkK2UiuJdE_3-KdyrlaurG1BeX6v1XlbgdnVnqwwbNdgu3wEzv7ZV29wYpJmZgRvD54IkWYhjFTU1qFZj1smmU-Dkop98fi5enNzT2YfnUG63wt43H0hohSAktFTYkYkyebPK-aUlY4prBsYOKRCW78reFwl4SWjCBsGrpE2DCGbbAM_Vk-G4OueEKxKD-S4XnrGbAt37DKh5Fz28eb2hFpdmm9JH4UkXFh9T2wzMN4q5cTmxrUeS9dMkARcKb1ILwScRYIt88AgaiXhUlDhrhdthI9Bch9y1HR4J09QxnL14C9aneNI6Fc9Wo6a9S-Yl7QzoOXkFdbZCvm1CwqjrcP_B7rU6m9RZstsWV9_iGkFDDRp-ZSKmdkAjbnkUjDXswrefPfv1--cbqEad7eEhiBEBCS8e2JerGI9Ow2TC-3BbzKcT_vH1kPAA-RinJ_C9Rb5JBssVVBzHyKbQbWpNY7tyjq4Ae989nII4HXB9Fd9jEv4z5manO-TxKRs9GXJr179Dbq0fUh57Hlk4FEWAT-a7L48AX7PRfbSF1HyPN7H31SB5ge8xbv1fzCdu_Dr3O6YYejI6WecsmzVtUdtigF2zL6E2mVNAujk3PDnAUqyluMdcrUJKMZ-Uj9GQHUUxdab3yac6c82rR3sYtnXk27GRmctrV0p_oDT_vq195u6hcSPFwo6HenCjDmeVqUjqlgyFZq6TLuVsFuYesQPmZorFhYKTzWSK6Wwpn8s4ZvUJc-cLhYVizsmWSvlC2kk72exxih3awpmFfM4pFLJ5s54pFfMpZljTUlXie91e78d_AUVrgqU)

## Custom Middleware - Personalize o bot sem modificar arquivos principais

O arquivo `src/middlewares/customMiddleware.js` permite adicionar lógica personalizada sem mexer nos arquivos core do bot.

### Quando usar?

- ✅ Adicionar comportamentos personalizados
- ✅ Criar logs customizados
- ✅ Implementar lógica específica por grupo
- ✅ Reagir a eventos automáticos

### Exemplos práticos

#### Exemplo 1: Reagir automaticamente a mensagens

```javascript
export async function customMiddleware({ socket, webMessage, type, commonFunctions }) {
  if (type === "message" && commonFunctions) {
    const { userMessageText } = commonFunctions;
    if (userMessageText?.toLowerCase() === "oi") {
      await socket.sendMessage(webMessage.key.remoteJid, {
        react: { text: "👋", key: webMessage.key }
      });
    }
  }
}
```

#### Exemplo 2: Log quando alguém entra no grupo

```javascript
export async function customMiddleware({ webMessage, type, action }) {
  if (type === "participant" && action === "add") {
    console.log("Novo membro:", webMessage.messageStubParameters[0]);
  }
}
```

#### Exemplo 3: Mensagem personalizada em grupo específico

```javascript
export async function customMiddleware({ type, action, commonFunctions }) {
  const grupoVIP = "120363123456789012@g.us";
  
  if (type === "participant" && action === "add" && commonFunctions?.remoteJid === grupoVIP) {
    const { sendReply } = commonFunctions;
    await sendReply("🎉 Bem-vindo ao grupo VIP!");
  }
}
```

#### Exemplo 4: Usar funções avançadas do bot

```javascript
export async function customMiddleware({ type, commonFunctions }) {
  if (type === "message" && commonFunctions) {
    const {
      sendReply,
      sendSuccessReply,
      args,
      userMessageText,
      isImage,
      downloadImage,
    } = commonFunctions;
    
    // Sua lógica personalizada aqui
  }
}
```

### Parâmetros disponíveis

| Parâmetro | Tipo | Descrição |
|-----------|------|----------|
| `socket` | Object | Socket do Baileys para enviar mensagens |
| `webMessage` | Object | Mensagem completa do WhatsApp |
| `type` | String | "message" ou "participant" |
| `commonFunctions` | Object/null | Todas as funções do bot (null para eventos de participantes) |
| `action` | String | "add" ou "remove" (apenas em eventos de participantes) |
| `data` | String | Dados do participante (apenas em eventos de participantes) |

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
- `sendReply(text, mentions)`
- `sendReact(emoji)`
- `sendSuccessReply(text, mentions)`, `sendErrorReply(text, mentions)`, `sendWarningReply(text, mentions)`, `sendWaitReply(text, mentions)`
- `sendSuccessReact()`, `sendErrorReact()`, `sendWarningReact()`, `sendWaitReact()`

#### Funções utilitárias de grupo

- `getGroupMetadata()` - Obter metadados completos do grupo
- `getGroupName()` - Obter apenas o nome do grupo
- `getGroupOwner()` - Obter informações do dono do grupo
- `getGroupParticipants()` - Obter todos os participantes do grupo
- `getGroupAdmins()` - Obter administradores do grupo

### 🎯 Exemplos de uso com menções

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

- 📁 .github ➔ _workflows de CI/CD e arquivo para o agente do copilot_
- 📁 assets ➔ _arquivos de mídia_
  - 📁 auth ➔ _arquivos da conexão do bot_
  - 📁 images ➔ _arquivos de imagem_
    - 📁 funny ➔ _gifs de comandos de diversão_
  - 📁 samples ➔ _arquivos de exemplo para testes_
  - 📁 temp ➔ _arquivos temporários_
- 📁 database ➔ _arquivos de dados_
- 📁 diagrams ➔ _diagramas de fluxos de dados e execução do Bot_
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
  - 📁 test ➔ _testes_
  - 📁 utils ➔ _utilitários_
  - 📝 config.js ➔ _arquivo de configurações do bot_
  - 📝 connection.js ➔ _script de conexão do bot com a biblioteca Baileys_
  - 📝 index.js ➔ _script ponto de entrada do bot_
  - 📝 loader.js ➔ _script de carga de funções_
  - 📝 menu.js ➔ _menu do bot_
  - 📝 messages.js ➔ _arquivos de mensagens de boas vindas e saída_
  - 📝 test.js ➔ _script de testes_
- 📝 .gitignore ➔ _arquivo para não subir certas pastas no GitHub_
- 📝 ⚡-cases-estao-aqui.js ➔ _easter egg_
- 📝 AGENTS.md ➔ _arquivo de instruções para IA's_
- 📝 CLAUDE.md ➔ _arquivo de instruções para a IA Claude_
- 📝 GEMINI.md ➔ _arquivo de instruções para a IA Gemini_
- 📝 CONTRIBUTING.md ➔ _guia de contribuição_
- 📝 LICENSE ➔ _arquivo de licença_
- 📝 package-lock.json ➔ _arquivo de cache das dependências do bot_
- 📝 package.json ➔ _arquivo de definição das dependências do bot_
- 📝 README.md ➔ _esta documentação_
- 📝 reset-qr-auth.sh ➔ _arquivo para excluir as credenciais do bot_
- 📝 update.sh ➔ _arquivo de atualização do bot_

## Atualizar o bot

Execute `bash update.sh`

## Testes

Execute `npm run test:all`

## Erros comuns

### 📁 Operação negada ao extrair a pasta

O erro abaixo acontece quando é feito o download do arquivo ZIP direto no celular em algumas versões do apk ZArchiver e também de celulares sem root.

Para resolver, siga o [tutorial de instalação via git clone](#instalação-no-termux).

![erro comum 1](./assets/images/erro-comum-1.jpg)

### 🔄 Remoção dos arquivos de sessão e conectar novamente

Caso dê algum erro na conexão, digite o seguinte comando:

```sh
bash reset-qr-auth.sh
```

Depois, remova o dispositivo do WhatsApp indo nas configurações do WhatsApp em "dispositivos conectados" e repita
o procedimento de iniciar o bot com `npm start`.

### 🔐 Permission denied (permissão negada) ao acessar `cd /sdcard`

![erro comum 2](./assets/images/erro-comum-2.png)

Abra o termux, digite `termux-setup-storage` e depois, aceite as permissões

### ⚙️ Você configura o token da Spider API, prefixo, etc e o bot não reconhece

Verifique se você não tem dois Takeshi's rodando no seu celular, muitas pessoas baixam o zip e seguem o tutorial, porém, **o tutorial não explica pelo zip, e sim, pelo git clone**.

Geralmente as pessoas que cometem esse erro, ficam com dois bots:

1. O primeiro dentro da `/sdcard`
2. O segundo na pasta `/storage/emulated/0/Download`, que no zip fica como `takeshi-bot-main`

Você deve apagar um dos bots e tanto configurar quanto executar **apenas um**

## Inscreva-se no canal

[![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/@devgui_?sub_confirmation=1)

## Contribuindo com o projeto

O Takeshi Bot é um projeto **open source** e sua contribuição é muito bem-vinda!

### 🚀 Como contribuir

- 🐛 **Reportar bugs** através das [Issues](https://github.com/guiireal/takeshi-bot/issues)
- ✨ **Sugerir novas funcionalidades**
- 🔧 **Contribuir com código** (novos comandos, correções, melhorias)
- ⭐ **Dar uma estrela** no repositório

### 📖 Antes de contribuir

1. Leia nosso **[Guia de Contribuição](CONTRIBUTING.md)** completo
2. Verifique as [Issues abertas](https://github.com/guiireal/takeshi-bot/issues)
3. Siga o template obrigatório para Pull Requests

## Licença

[GPL-3.0](https://github.com/guiireal/takeshi-bot/blob/main/LICENSE)

Este projeto está licenciado sob a Licença Pública Geral GNU (GPL-3.0).
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
