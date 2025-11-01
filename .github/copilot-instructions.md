# Takeshi Bot - AI Coding Assistant Instructions

## Project Overview
Takeshi Bot is a modular WhatsApp bot built on Baileys (WhatsApp Web API) with a command-based architecture. The bot supports multi-function capabilities including media handling, admin controls, AI integrations, and group management.

**Key Philosophy**: Commands are NOT "cases" in a giant switch statement. Each command is a separate file in role-based folders (`admin/`, `member/`, `owner/`). This maintains clean, maintainable code.

## Architecture

### Command System
- **Location**: `src/commands/{admin|member|owner}/`
- **Auto-loading**: Commands are dynamically loaded at startup via `src/utils/dynamicCommand.js`
- **Permission model**: Folder placement determines who can execute:
  - `owner/` - Bot/group owner only
  - `admin/` - Group admins only
  - `member/` - All group members

**Command template** (`src/commands/🤖-como-criar-comandos.js`):
```javascript
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "comando",
  description: "Descrição do comando",
  commands: ["comando1", "comando2"], // aliases
  usage: `${PREFIX}comando`,
  handle: async ({ sendReply, args, isImage, /* ... */ }) => {
    // Implementation - NO permission checks needed, folder handles it
  },
};
```

### Message Flow
1. **Entry**: `src/middlewares/onMesssagesUpsert.js` - Receives all WhatsApp messages
2. **Common functions**: `src/utils/loadCommonFunctions.js` - Extracts message data, provides send* helpers
3. **Router**: `src/utils/dynamicCommand.js` - Matches commands, enforces permissions, handles errors
4. **Execution**: Individual command file's `handle()` function

### Database System
- **Format**: JSON files in `database/` directory
- **Access**: Through `src/utils/database.js` functions ONLY
- **Pattern**: Read JSON → Modify → Write JSON (file-based, no SQL)
- **Key files**: 
  - `config.json` - Runtime settings (prefix, tokens, numbers)
  - `auto-responder.json` - Match/answer pairs
  - `muted.json` - Per-group muted members

**Never** read/write JSON files directly. Use exported functions like `activateAntiLinkGroup()`, `getPrefix()`, `setBotNumber()`.

## Critical Developer Patterns

### 1. Using CommandHandleProps
The `handle` function receives a rich context object. Available properties are **TypeScript-documented** in `src/@types/index.d.ts`:

```javascript
handle: async ({ 
  args,           // ["arg1", "arg2"] - split by / | \
  fullArgs,       // "arg1 / arg2" - raw string
  isImage,        // boolean - message type checks
  sendReply,      // Send quoted reply
  sendSuccessReply, sendErrorReply, sendWarningReply, // Pre-styled responses
  downloadImage,  // Extract media from message
  getGroupAdmins, // Fetch group metadata
  // ... 50+ more utilities
}) => { /* ... */ }
```

**Rule**: Always destructure only what you need. Check `src/@types/index.d.ts` for full API.

### 2. Media Handling Pattern
Three variants for each media type (audio, image, video, sticker, document, gif):

```javascript
// From local file
await sendImageFromFile("./assets/image.jpg", "Caption", [mentions], quoted);

// From URL
await sendImageFromURL("https://example.com/img.png", "Caption");

// From buffer (after download/processing)
const buffer = await getBuffer(url);
await sendImageFromBuffer(buffer, "Caption");
```

**Important**: Audio uses `sendAudioFrom*` with `asVoice` boolean parameter for PTT (Push-to-Talk).

### 3. Error Handling
Use custom error classes from `src/errors/`:

```javascript
const { InvalidParameterError, WarningError } = require("../errors");

// Throws are caught by dynamicCommand and auto-formatted
if (!args[0]) throw new InvalidParameterError("Missing required parameter");
if (notAllowed) throw new WarningError("Action not permitted");
```

Generic errors are caught and displayed with details. Axios errors show API-specific messages.

### 4. Configuration Access
**Runtime settings** can override `src/config.js`:

```javascript
const { getBotNumber, getPrefix, getSpiderApiToken } = require("./utils/database");

// DON'T: const { PREFIX } = require("./config"); 
// DO:
const prefix = getPrefix(remoteJid); // Checks database first, falls back to config
```

### 5. Bad MAC Error Handling
The bot has automatic recovery for WhatsApp's "Bad MAC" errors via `src/utils/badMacHandler.js`:
- Tracks error count with 15-attempt limit
- Auto-clears session files when limit reached
- Handles session errors gracefully in connection and message processing

**Don't** add manual Bad MAC handling in commands.

## Development Workflows

### Running the Bot
```bash
npm start           # Development with --watch flag
npm run test        # Run src/test.js
npm run test:all    # Execute all Node.js tests
bash update.sh      # Pull latest changes from git
bash reset-qr-auth.sh # Delete session files and reconnect
```

### Adding a New Command
1. Create file in `src/commands/{admin|member|owner}/nome-do-comando.js`
2. Copy template from `🤖-como-criar-comandos.js`
3. Implement `handle` function with destructured props
4. **No restart needed** - dynamic loader picks it up

### Testing Commands
- Use `/exemplos-de-mensagens` to see 24 working examples of send functions
- Check `src/commands/member/exemplos/` for real implementations
- Test media with sample files in `assets/samples/`

### Debugging
- Set `DEVELOPER_MODE = true` in `src/config.js` to log all incoming messages
- Logs stored in `assets/temp/wa-logs.txt` via Pino
- Use `errorLog()`, `warningLog()`, `successLog()` from `src/utils/logger.js`

## Integration Points

### External API - Spider X API
- **Config**: `SPIDER_API_TOKEN` in `src/config.js` or runtime via `setSpiderApiToken()`
- **Service wrapper**: `src/services/spider-x-api.js`
- **Used for**: TikTok downloads, YouTube, Google search, AI stickers, etc.
- **Error handling**: Axios errors auto-detected and formatted by `dynamicCommand.js`

### Baileys (WhatsApp)
- **Connection**: `src/connection.js` - Handles pairing, reconnection, caching
- **State**: Stored in `assets/auth/baileys/` (creds.json, pre-keys)
- **Socket**: Passed to all commands via `loadCommonFunctions`
- **Group cache**: 24-hour TTL via NodeCache to reduce API calls

### FFmpeg (Media Processing)
- **Service**: `src/services/ffmpeg.js`
- **Used for**: Audio format conversion (to Opus for PTT)
- **Pattern**: `ajustAudioByBuffer()` - Converts MP3/WAV to Opus, returns buffer + temp paths

## Project-Specific Conventions

### File Naming
- Commands: `kebab-case.js` (e.g., `anti-link.js`, `set-menu-image.js`)
- Use emoji prefix for tutorial files: `🤖-como-criar-comandos.js`

### Global Variables
- `BASE_DIR` - Set in `src/loader.js`, points to `src/` directory
- Used for requires: `require(\`\${BASE_DIR}/config\`)`

### Message Processing Timeout
- All message handlers have 700ms delay (`TIMEOUT_IN_MILLISECONDS_BY_EVENT`)
- Prevents WhatsApp rate limiting/bans
- Enforced in `src/loader.js`

### Mentions Format
JID format: `"5511999999999@s.whatsapp.net"` (full number + @s.whatsapp.net)

In messages: `@5511999999999` (number only, array passed separately)

```javascript
await sendReply(
  "Olá @5511999999999!",
  ["5511999999999@s.whatsapp.net"]
);
```

### Prefix System
- Default: `=` (configured in `src/config.js`)
- Per-group override: Stored in `database/prefix-groups.json`
- Always use `getPrefix(remoteJid)` to get effective prefix

## Common Gotchas

1. **Don't use `webMessage` directly** - Extract via `loadCommonFunctions` or use provided `isImage`, `isVideo`, etc.
2. **Permission checks are automatic** - Folder placement handles it, don't add manual `isAdmin()` checks
3. **Media downloads create temp files** - Use `removeFileWithTimeout()` after processing
4. **Auto-responder runs when no command matches** - Check `database/auto-responder.json`
5. **Group metadata is cached** - Use `getGroupMetadata()` helper, not raw `socket.groupMetadata()`

## Example: Complete Command

```javascript
const { PREFIX } = require(`${BASE_DIR}/config`);
const { InvalidParameterError } = require("../../errors");

module.exports = {
  name: "exemplo",
  description: "Demonstra padrões do Takeshi Bot",
  commands: ["exemplo", "ex"],
  usage: `${PREFIX}exemplo <argumento>`,
  handle: async ({ 
    args, 
    isImage, 
    sendSuccessReply, 
    sendErrorReply,
    downloadImage,
    sendImageFromBuffer 
  }) => {
    if (!args[0] && !isImage) {
      throw new InvalidParameterError("Envie uma imagem ou argumento");
    }

    if (isImage) {
      const imagePath = await downloadImage(webMessage, "exemplo");
      // Process image...
      await sendSuccessReply("Imagem processada!");
    } else {
      await sendSuccessReply(`Argumento recebido: ${args[0]}`);
    }
  },
};
```

---

**Remember**: This codebase values clarity over cleverness. Each command is self-contained, permissions are implicit, and helpers abstract Baileys complexity. When in doubt, check `src/@types/index.d.ts` or explore `src/commands/member/exemplos/`.
