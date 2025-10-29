# 🚀 Guia Rápido: Instalação do yt-dlp

Este guia fornece instruções de instalação do **yt-dlp** e **ffmpeg**, dependências necessárias para os comandos de download de vídeos/áudios do bot.

## 📋 Verificação de Instalação

Antes de instalar, verifique se já estão instalados:

```bash
yt-dlp --version
ffmpeg -version
```

Se ambos mostrarem as versões, você já está pronto! ✅

## 🪟 Windows

### Método 1: Usando winget (Recomendado)

```powershell
# Instalar yt-dlp
winget install yt-dlp

# Instalar ffmpeg
winget install ffmpeg
```

### Método 2: Download Manual

**yt-dlp:**
1. Acesse: https://github.com/yt-dlp/yt-dlp/releases/latest
2. Baixe `yt-dlp.exe`
3. Mova para uma pasta no PATH (ex: `C:\Windows\System32\`)

**ffmpeg:**
1. Acesse: https://ffmpeg.org/download.html
2. Baixe o build para Windows
3. Extraia e adicione ao PATH

### Método 3: Usando Chocolatey

```powershell
choco install yt-dlp ffmpeg
```

## 🐧 Linux (Ubuntu/Debian)

### yt-dlp

```bash
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

### ffmpeg

```bash
sudo apt update
sudo apt install ffmpeg -y
```

### Verificar instalação

```bash
yt-dlp --version
ffmpeg -version
```

## 🍎 macOS

### Usando Homebrew (Recomendado)

```bash
# Instalar Homebrew (se não tiver)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar yt-dlp e ffmpeg
brew install yt-dlp ffmpeg
```

### Download Manual

```bash
# yt-dlp
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp

# ffmpeg - baixe de: https://ffmpeg.org/download.html
```

## 📱 Termux (Android)

```bash
# Atualizar pacotes
pkg update && pkg upgrade -y

# Instalar Python e pip
pkg install python -y

# Instalar yt-dlp via pip
pip install yt-dlp

# Instalar ffmpeg
pkg install ffmpeg -y
```

### Verificar instalação

```bash
yt-dlp --version
ffmpeg -version
```

## 🐳 Docker

Se você estiver rodando o bot em Docker, adicione ao seu `Dockerfile`:

```dockerfile
# Para Alpine Linux
RUN apk add --no-cache python3 py3-pip ffmpeg
RUN pip3 install yt-dlp

# Para Ubuntu/Debian
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    && pip3 install yt-dlp \
    && rm -rf /var/lib/apt/lists/*
```

## 🔧 Solução de Problemas

### Problema: "yt-dlp: command not found"

**Solução Linux/Mac:**
```bash
# Verificar se está no PATH
echo $PATH

# Adicionar ao PATH (adicione ao ~/.bashrc ou ~/.zshrc)
export PATH="$PATH:/usr/local/bin"

# Recarregar configuração
source ~/.bashrc  # ou source ~/.zshrc
```

**Solução Windows:**
1. Painel de Controle → Sistema → Configurações Avançadas
2. Variáveis de Ambiente
3. Adicionar caminho do yt-dlp.exe à variável PATH

### Problema: "Permission denied"

```bash
# Dar permissão de execução (Linux/Mac)
sudo chmod +x /usr/local/bin/yt-dlp
```

### Problema: Versão desatualizada

```bash
# Atualizar yt-dlp
yt-dlp -U

# Ou via pip
pip install -U yt-dlp
```

### Problema: ffmpeg não encontrado

```bash
# Verificar se está instalado
which ffmpeg

# Se não estiver, instalar conforme instruções acima
```

## 📦 Instalação via Python pip (Universal)

Se você já tem Python instalado:

```bash
# Instalar yt-dlp via pip
pip install yt-dlp

# Ou para todos os usuários (pode precisar de sudo)
pip install --user yt-dlp

# Atualizar
pip install -U yt-dlp
```

## ✅ Teste Final

Após a instalação, teste os comandos:

```bash
# Testar yt-dlp
yt-dlp --version

# Testar download (não faz download, apenas simula)
yt-dlp --simulate "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# Testar ffmpeg
ffmpeg -version
```

Se tudo estiver OK, você verá as versões e nenhum erro! ✅

## 🆘 Ainda com problemas?

1. Reinicie o terminal/shell
2. Verifique se o PATH está configurado corretamente
3. Tente reinstalar as ferramentas
4. Verifique os logs de erro para mais detalhes

## 📚 Recursos Adicionais

- **yt-dlp GitHub:** https://github.com/yt-dlp/yt-dlp
- **yt-dlp Wiki:** https://github.com/yt-dlp/yt-dlp/wiki
- **ffmpeg Site Oficial:** https://ffmpeg.org/
- **Sites Suportados:** https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md

---

**Pronto!** Após a instalação, os comandos de download do bot funcionarão perfeitamente! 🎉
