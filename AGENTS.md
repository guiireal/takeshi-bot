# TAKESHI BOT AGENT GUIDE

This file is the single source of truth for agents and contributors who need fast, reliable project context.

Use it as the primary documentation for:

- architecture and runtime flow
- command authoring rules
- configuration and persistence rules
- service boundaries
- supported hosting context
- AI-agent operating rules and local skills

For installation walkthroughs and end-user tutorials, see `README.md`.

## PROJECT_OVERVIEW

**Takeshi Bot** is a modular WhatsApp bot framework built on the Baileys ecosystem.

Core principles:

- file-oriented command architecture instead of giant switch/case handlers
- clear separation of permissions by folder
- simple JSON persistence
- reusable services and middleware
- code optimized for readability and maintenance

Permission model:

- `src/commands/owner` → bot owner features
- `src/commands/admin` → group administration features
- `src/commands/member` → features available to regular members

The project philosophy is simple: code for humans first.

## ARCHITECTURE

Main runtime flow:

1. `index.js` or `src/index.js` boots the bot.
2. `src/connection.js` opens the WhatsApp connection, loads auth state, handles pairing, and reconnects when needed.
3. `src/loader.js` registers listeners and wraps event execution with safe error handling.
4. `src/middlewares/onMesssagesUpsert.js` receives messages, filters stale events, handles muted users and participant events, and injects common functions.
5. `src/utils/dynamicCommand.js` validates prefix, permission, group state, and dispatches the selected command.
6. `src/services/*` and `src/utils/*` provide integrations, media processing, database access, and helpers.

High-value architectural notes:

- the bot stores its WhatsApp auth state in `assets/auth/baileys/`
- `TIMEOUT_IN_MILLISECONDS_BY_EVENT` throttles event handling to reduce spam-ban risk
- `badMacHandler` is part of the self-healing strategy for session issues
- `loadCommonFunctions.js` is the main injection layer for command helpers

## CORE_FILES

| Path | Responsibility |
| --- | --- |
| `index.js` | Root entrypoint for hosts that expect a root `index.js`. |
| `src/index.js` | Main source entrypoint. |
| `src/config.js` | Core runtime configuration, tokens, directories, flags, and platform settings. |
| `src/connection.js` | WhatsApp socket setup, pairing, session persistence, reconnection logic. |
| `src/loader.js` | Event registration and safe wrapper logic. |
| `src/middlewares/onMesssagesUpsert.js` | Main inbound message processing pipeline. |
| `src/middlewares/customMiddleware.js` | Official extension point for custom global logic. |
| `src/utils/dynamicCommand.js` | Prefix validation, permission enforcement, and command dispatch. |
| `src/utils/loadCommonFunctions.js` | Injected helper functions used by command handlers. |
| `src/utils/database.js` | Safe access layer for JSON persistence. |
| `src/@types/index.d.ts` | Typing and documentation for command and middleware props. |
| `src/services/spider-x-api.js` | Spider X integration for downloads, AI, Pinterest, Brat, and related endpoints. |
| `src/services/sticker.js` | Sticker processing and EXIF handling. |
| `src/services/ffmpeg.js` | Media conversion and audio/video processing. |

## COMMAND_GUIDE

Command template:

```javascript
import { PREFIX } from "../../config.js";
import { InvalidParameterError } from "../../errors/index.js";

export default {
  name: "command",
  description: "What it does",
  commands: ["alias1", "alias2"],
  usage: `${PREFIX}command <args>`,
  handle: async ({ sendReply, args }) => {
    if (!args[0]) throw new InvalidParameterError("Missing arguments!");
    await sendReply("Success!");
  },
};
```

Command authoring rules:

- always use injected helpers from `handle()` before introducing new low-level logic
- never manually enforce owner/admin/member permission inside the command if folder placement already defines it
- use `src/errors/` custom errors for automatic user-facing responses
- keep commands focused and readable
- prefer existing helpers and services over duplicating code
- if a command needs persistence, go through `src/utils/database.js`

## TYPING_AND_MIDDLEWARE

Typing lives in `src/@types/index.d.ts`.

Important interfaces:

- `CommandHandleProps`
- `CustomMiddlewareProps`

Useful `handle()` capabilities:

- media flags: `isImage`, `isVideo`, `isAudio`, `isSticker`
- send helpers: `sendReply()`, `sendSuccessReply()`, `sendReact()`, `sendImageFromURL()`, `sendStickerFromFile()`
- download helpers: `downloadImage()`, `downloadVideo()`, `downloadAudio()`, `downloadSticker()`
- context values: `args`, `fullArgs`, `fullMessage`, `remoteJid`, `replyText`, `userLid`

Custom global logic should go into `src/middlewares/customMiddleware.js`.

Use it for:

- custom logs
- extra validations
- automatic reactions
- per-group behavior
- custom participant hooks

Do not modify core middleware flow unless there is a real architectural need.

## DATA_RULES

The bot uses JSON files in `database/` for persistence.

Important files:

| File | Role |
| --- | --- |
| `config.json` | runtime values such as tokens and mutable settings |
| `prefix-groups.json` | custom prefixes per group |
| `auto-responder.json` | trigger/answer entries |
| `muted.json` | muted users by group |
| `inactive-groups.json` | groups where the bot is disabled |
| `group-restrictions.json` | restrictions by message type |

Mandatory rule:

- **never** read these files directly with `fs.readFileSync` inside commands
- always use `src/utils/database.js`

This keeps persistence behavior consistent and avoids duplicated parsing logic.

## SERVICES

### Spider X API

`src/services/spider-x-api.js` powers:

- downloads from TikTok, YouTube, Instagram, Facebook, Pinterest
- AI endpoints such as Gemini, GPT-5 Mini, Flux
- sticker endpoints such as `attp`, `ttp`, and `brat`
- utility endpoints used by several commands

It depends on `SPIDER_API_TOKEN`, which can come from:

- `src/config.js`
- runtime database config through `/set-spider-api-token`

### Media Services

`src/services/ffmpeg.js` handles media conversion, including audio normalization and voice-note friendly formats.

`src/services/sticker.js` handles:

- static sticker processing
- animated sticker workflows
- EXIF metadata
- WebP packaging

## STACK

Runtime and dependency snapshot from the root `package.json`:

- Node.js `>=22.8.0`
- `baileys@7.0.0-rc.9`
- `axios@1.14.0`
- `openai@6.33.0`
- `tiktoken@1.0.21`
- `@cacheable/node-cache@3.0.0`
- `node-cache@5.1.2`
- `node-webpmux@3.2.1`
- `pino@10.3.1`
- `correios-brasil@3.0.6`
- `verbose@0.2.3`

Project-level scripts:

- `npm start`
- `npm test`
- `npm run test:all`

## COMMAND_CATALOG

Current command footprint:

- `8` owner command files
- `36` admin command files
- `78` member command files, including examples

### Owner

- `exec`
- `get-group-id`
- `on`
- `off`
- `set-menu-image`
- `set-prefix`
- `set-spider-api-token`
- `testing`

### Admin

Main categories:

- moderation: `ban`, `mute`, `unmute`, `warn`, `unwarn`, `warn-reactivate`, `block-wpp`, `delete`
- group management: `abrir`, `fechar`, `set-name`, `promover`, `rebaixar`, `link-grupo`, `hide-tag`, `revelar`, `limpar`
- restrictions: `anti-link`, `anti-audio`, `anti-document`, `anti-event`, `anti-image`, `anti-product`, `anti-sticker`, `anti-video`, `only-admin`
- automation: `auto-responder`, `add-auto-responder`, `list-auto-responder`, `delete-auto-responder`, `welcome`, `exit`, `auto-sticker`, `agendar-mensagem`
- infra and account utilities: `saldo`, `set-proxy`

### Member

Utility and media commands:

- `menu`
- `info`
- `ping`
- `perfil`
- `suporte`
- `meu-lid`
- `sticker`
- `rename`
- `to-image`
- `to-gif`
- `to-mp3`
- `attp`
- `ttp`
- `brat`
- `fake-chat`
- `gerar-link`

Downloads:

- `instagram`
- `facebook`
- `tik-tok`
- `play-audio`
- `play-video`
- `yt-mp3`
- `yt-mp4`
- `pinterest` / `pin`

AI:

- `gemini`
- `gpt-5-mini`
- `flux`
- `ia-sticker`

Search:

- `cep`
- `yt-search`

Canvas/image manipulation:

- `blur`
- `bolsonaro`
- `cadeia`
- `contraste`
- `espelhar`
- `gray`
- `inverter`
- `pixel`
- `rip`

Fun commands:

- `abracar`
- `beijar`
- `dado`
- `jantar`
- `lutar`
- `matar`
- `socar`
- `tapa`

Examples:

`src/commands/member/exemplos/` contains message sending examples for:

- text
- replies and reactions
- audio, image, video, and GIF
- stickers
- documents
- polls, contacts, and locations
- carousels
- message metadata and group helpers

## HOSTING_AND_PTERODACTYL

The project README currently highlights these supported hosts:

- Bronxys
- NexFuture
- Speed Cloud
- TED Host
- Nodz Host
- Cebolinha Host
- Raikken
- Imperio Cloud

Installation tutorials stay in `README.md`.

If the topic is about hosting, VPS setup, startup configuration, schedules, SFTP, Pterodactyl panel usage, or backup flow, agents should also load:

- `.skills/pterodactyl-specialist/SKILL.md`

That skill is the specialized source for Pterodactyl guidance.

## STABILITY_AND_ERRORS

Stability mechanisms:

- `DEVELOPER_MODE` in `src/config.js` increases logging
- runtime logs are stored in `assets/temp/wa-logs.txt`
- `src/utils/badMacHandler.js` helps recover from repeated session failures
- `TIMEOUT_IN_MILLISECONDS_BY_EVENT` throttles event execution

Use these custom error classes:

- `InvalidParameterError`
- `WarningError`
- `DangerError`

These are expected by the bot flow and produce cleaner automatic replies.

## AGENT_RULES

Agents working in this repository should follow these rules:

- prefer `AGENTS.md` as the primary project context source
- use `README.md` for installation and end-user tutorials
- treat the repository as modular and file-oriented
- avoid manual JSON reads from `database/` in command code
- prefer existing helpers and services before adding new primitives
- never modify `assets/auth/` manually
- when supporting users, stay read-only unless explicitly asked to change code
- when support needs extra context, load only the relevant sections or files
- never expose the values of `OPENAI_API_KEY`, `LINKER_API_KEY`, or `SPIDER_API_TOKEN`

## SKILLS

This repository uses a local skills pattern to help AI agents load specialized context only when needed.

Current local skill directory:

- `.skills/pterodactyl-specialist/`

Current local skill:

- `pterodactyl-specialist` → focused instructions for Pterodactyl panel usage, hosting workflows, files, databases, backups, schedules, bots, and APIs

Skill usage rule:

- if the topic is about hosting or **Pterodactyl**, load `.skills/pterodactyl-specialist/SKILL.md`

This keeps support and agent workflows selective instead of forcing every answer to carry all hosting knowledge by default.
