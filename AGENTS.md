# 🤖 TAKESHI BOT

**Takeshi Bot** is a multifunctional WhatsApp bot framework built on the Baileys ecosystem, focused on modular architecture, scalability, and easy maintenance.

## 📑 DYNAMIC INDEX

1. [🌍 Overview & Philosophy](#-overview--philosophy)
2. [🏗️ Architecture & Exclusive Flow](#-architecture--exclusive-flow)
3. [⌨️ Command Development Guide](#-command-development-guide)
4. [🛠️ Customization & Typing](#-customization--typing)
5. [🗄️ Data System & Configuration](#-data-system--configuration)
6. [🔌 Services & Integrations](#-services--integrations)
7. [🛡️ Stability, Debugging & Errors](#-stability-debugging--erros)
8. [📋 Command Catalog](#-command-catalog)

---

## 🌍 OVERVIEW & PHILOSOPHY

The project abandons the giant "switch-case" system in favor of a **file-oriented architecture**.

*   **Modularity:** Each command is a `.js` file in `src/commands/`.
*   **Implicit Permissions:** The folder where the command is located (`admin/`, `member/`, `owner/`) defines access.
*   **Tech Stack:** Node.js 22+, Baileys v6.7+, Spider X API.
*   **Philosophy:** "Code for humans: simple, readable, and decoupled."

---

## 🏗️ ARCHITECTURE & EXCLUSIVE FLOW

### 1. Initialization and Connection (`src/connection.js`)
*   Manages the socket and persistence in `assets/auth/baileys/`.
*   Implements group metadata caching (24h) for high performance.

### 2. Loading and Listeners (`src/loader.js`)
*   Registers socket events.
*   Enforces `TIMEOUT_IN_MILLISECONDS_BY_EVENT` (700ms) to prevent SPAM bans.

### 3. Message Processing (`src/middlewares/onMessagesUpsert.js`)
*   Intercepts messages, extracts data, and injects tools via `loadCommonFunctions.js`.

### 4. Dynamic Routing (`src/utils/dynamicCommand.js`)
*   Analyzes the prefix, checks folder permissions, and executes the command or triggers the `auto-responder`.

---

## ⌨️ COMMAND DEVELOPMENT GUIDE

### Command Template (`src/commands/🤖-como-criar-comandos.js`)

```javascript
import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";

export default {
  name: "command",
  description: "What it does",
  commands: ["alias1", "alias2"],
  usage: `${PREFIX}command <args>`,
  handle: async ({ sendReply, args, isImage, ...func }) => {
    if (!args[0]) throw new InvalidParameterError("Missing arguments!");
    await sendReply("Success!");
  },
};
```

### Handle Properties (CommandHandleProps)
Access via `src/@types/index.d.ts`:
*   **Media:** `isImage`, `isVideo`, `isAudio`, `isSticker`.
*   **Sending:** `sendReply()`, `sendSuccessReply()`, `sendImageFromURL()`, `sendReact()`.
*   **Downloads:** `downloadImage()`, `downloadVideo()`, etc.

---

## 🛠️ CUSTOMIZATION & TYPING

### 🛡️ Secure Middleware
The [src/middlewares/customMiddleware.js](src/middlewares/customMiddleware.js) file is the official entry point for users to create their own interceptors (hooks) without touching the bot's core. Use it for global logic, custom logs, or extra validations.

### ⌨️ Typing (TypeScript Definitions)
All autocomplete intelligence and parameter documentation are centralized in [src/@types/index.d.ts](src/@types/index.d.ts).
- `CommandHandleProps`: Properties injected into the `handle` of commands.
- `CustomMiddlewareProps`: Properties available in the custom middleware.

---

## 🗄️ DATA SYSTEM & CONFIGURATION

### JSON Database (`database/`)
The bot uses JSON for persistence. **Never** use `fs.readFileSync` directly.
*   **Correct Access:** Use `import { getPrefix, getSpiderApiToken } from "../utils/database.js";`.

| JSON | Function |
| :--- | :--- |
| `config.json` | Runtime configs (tokens, API keys). |
| `auto-responder.json` | Trigger/response pairs. |
| `prefix-groups.json` | Custom prefixes per group. |
| `muted.json` | Muted users per group. |

---

## 🔌 SERVICES & INTEGRATIONS

### 1. Spider X API (`src/services/spider-x-api.js`)
Engine for downloads (TikTok, YouTube, Insta) and AIs (Gemini, GPT-5, Flux).
*   **Configuration:** Requires `SPIDER_API_TOKEN` in `config.js` or via `/set-token`.

### 2. FFmpeg & Media (`src/services/ffmpeg.js` & `sticker.js`)
*   **Audio:** Automatic conversion to Opus (PTT/Voice) via `ajustAudioByBuffer()`.
*   **Stickers:** WebP processing with custom EXIF metadata.

---

## 🛡️ STABILITY, DEBUGGING & ERRORS

### Custom Errors (`src/errors/`)
Always use `throw` with the classes below for automatic responses:
*   `InvalidParameterError`: Syntax/argument error.
*   `WarningError`: Non-critical warning (e.g., system already active).
*   `DangerError`: Critical error or permission denied.

### Debugging
*   Enable `DEVELOPER_MODE = true` in `src/config.js`.
*   Real-time logs saved in `assets/temp/wa-logs.txt`.
*   **Auto-heal:** `src/utils/badMacHandler.js` clears session after 15 consecutive failures.

---

## 📋 COMMAND CATALOG

### 🔐 OWNER (`/owner`)
*   `exec`: Shell (restricted usage).
*   `on`/`off`: Activate/deactivate bot in the group.
*   `set-prefix`: Change group prefix.
*   `set-token`: Configure Spider API.

### 👮 ADMIN (`/admin`)
*   `ban`/`promote`/`demote`: Member management.
*   `anti-link`/`anti-audio`: Automatic filters.
*   `welcome`/`exit`: Configure welcome/goodbye messages.
*   `auto-responder`: Manage response system.

### 👥 MEMBER (`/member`)
*   `menu`: Interactive catalog.
*   `sticker`: Convert media to sticker.
*   `gemini`/`gpt-5`: Conversational AIs.
*   `flux`: Image generation.
*   `play-*`: Music and video downloads.
*   `instagram`/`tik-tok`: Downloaders.

---

### 📝 NOTES
*   **Context:** Always prioritize using `commonFunctions` injected in `handle()`.
*   **Permissions:** Never modify the `assets/auth/` folder manually.
*   **Extensions:** For new media types support, check `src/utils/loadCommonFunctions.js`.
*   **Specialization:** If the topic is about hosting or **Pterodactyl**, you must load the skill at [.skills/pterodactyl-specialist/SKILL.md](.skills/pterodactyl-specialist/SKILL.md).
* **Contribution:** If you want to contribute to the project, check the [CONTRIBUTING.md](CONTRIBUTING.md) guidelines.