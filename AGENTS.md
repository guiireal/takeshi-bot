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

**Takeshi Bot** is a modular WhatsApp bot framework built on `zapo-js`, an independent
implementation of the WhatsApp Web multi-device protocol.

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
2. `src/connection.js` builds the zapo `WaClient` (with a SQLite-backed store),
   opens the connection, handles pairing, and registers listeners via `src/loader.js`
   before connecting.
3. `src/loader.js` subscribes to `client.on("message" | "call" | "group")` and wraps
   event execution with safe error handling. It also builds the compatibility
   `socket` object (`src/services/wa.js`) passed down to everything below.
4. `src/middlewares/onMessage.js` receives one inbound message event at a time,
   filters stale events, handles muted users, and injects common functions.
   Participant add/remove is a *separate* `group` event, handled directly in
   `src/loader.js` — it does not go through `onMessage.js`.
5. `src/utils/dynamicCommand.js` validates prefix, permission, group state, and dispatches the selected command.
6. `src/services/*` and `src/utils/*` provide integrations, media processing, database access, and helpers.

High-value architectural notes:

- the bot stores its WhatsApp auth state in a SQLite file under `assets/auth/zapo/`
  (see `src/connection.js`), tracked in git the same way `assets/auth/baileys/` used
  to be — treat it as sensitive, it is enough to impersonate the linked device
- `src/services/wa.js` is a compatibility adapter: it exposes the same
  `sendMessage` / `groupMetadata` / `groupParticipantsUpdate` / etc. shape the
  codebase has always used, translating each call to the matching zapo
  coordinator (`client.message`, `client.group`, `client.presence`, ...).
  Prefer extending this adapter over reaching for `client` (`socket.client`)
  directly in commands, so the whole codebase keeps one send-shape.
- `src/services/interactiveMessages.js` builds native buttons/lists/carousels
  (`interactiveMessage`/`nativeFlowMessage`) from the legacy `buttons` /
  `interactiveButtons` / `sections` / `cards` DSL — no Baileys patch needed.
- TIMEOUT_IN_MILLISECONDS_BY_EVENT throttles event handling to reduce spam-ban risk
- `badMacHandler` is a defensive net for Signal/session-decrypt errors
- `loadCommonFunctions.js` is the main injection layer for command helpers

## CORE_FILES

| Path | Responsibility |
| --- | --- |
| `index.js` | Root entrypoint for hosts that expect a root `index.js`. |
| `src/index.js` | Main source entrypoint. |
| `src/config.js` | Core runtime configuration, tokens, directories, flags, and platform settings. |
| `src/connection.js` | zapo `WaClient` + SQLite store setup, pairing, reconnection logic. |
| `src/loader.js` | Event registration, safe wrapper logic, and socket-adapter wiring. |
| `src/services/wa.js` | Compatibility adapter translating the legacy socket API to zapo coordinators. |
| `src/services/interactiveMessages.js` | Buttons/lists/carousel DSL → native `interactiveMessage` builder. |
| `src/middlewares/onMessage.js` | Main inbound message processing pipeline (one event at a time). |
| `src/middlewares/customMiddleware.js` | Official extension point for custom global logic. |
| `src/utils/dynamicCommand.js` | Prefix validation, permission enforcement, and command dispatch. |
| `src/utils/loadCommonFunctions.js` | Injected helper functions used by command handlers. |
| `src/utils/database.js` | Safe access layer for JSON persistence. |
| `src/@types/index.d.ts` | Typing and documentation for command and middleware props. |
| `src/services/spider-x-api.js` | Spider X integration for downloads, AI, Pinterest, Brat, and related endpoints. |
| `src/services/sticker.js` | Sticker processing and EXIF handling. |
| `src/services/ffmpeg.js` | Media conversion and audio/video processing. |
| `src/services/profile.js` | Profile picture download/fallback helper. |

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

## ANTI_PAYMENT

Two entry points punish a payment message:

- direct: the bot reads a payment message live in the group (`messageHandler`)
- quoted: a member replies to a payment message, and the ORIGINAL author is
  removed, never the one who quoted (`handleQuotedPaymentRestriction`)

The quoted path is forgeable — `contextInfo.participant` and `quotedMessage` come
from the client — so it is gated by `src/utils/messageEnvelopeRegistry.js`, an
in-memory record of every group message envelope the bot received.

Deliberate rule: **only a message the bot actually read as a payment corroborates
a quote.** A message whose content was never decrypted does NOT corroborate.

| Recorded state | Quote outcome |
| --- | --- |
| `payment` (bot read a payment) | corroborated → punishes |
| `other` (readable, not payment) | contradicted → never punishes |
| `unreadable` (never decrypted) | not corroborated → never punishes |
| not recorded at all | not corroborated → never punishes |

An undecryptable message is indistinguishable from an ordinary message lost to a
Signal session failure, so it is never treated as evidence: acting on it removes
innocent members. The failure mode is always conservative — when in doubt, do not
punish. Do not punish based on undecryptable messages without a new signal that
actually proves payment content.

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

Runtime and dependency snapshot is in the root `package.json`

Project-level scripts:

- `npm start`
- `npm test`
- `npm run test:all`

## ZAPO_INTEGRATION

The bot runs on `zapo-js`, an independent implementation of the WhatsApp Web
multi-device protocol. There is **no patched dependency** and nothing is committed
under `node_modules/` — `npm install` alone is enough to get a working tree.

Two pieces bridge zapo's native API to the shape this codebase has always used:

| File | Role |
| --- | --- |
| `src/services/wa.js` | Compatibility adapter. Exposes `sendMessage`, `groupMetadata`, `groupParticipantsUpdate`, `groupSettingUpdate`, `groupUpdateSubject`, `groupInviteCode`, `updateBlockStatus`, `sendPresenceUpdate`, `profilePictureUrl` — translating each into the matching zapo coordinator call (`client.message`, `client.group`, `client.privacy`, `client.presence`, `client.profile`). `groupMetadata()` also back-fills the legacy `{ id, admin }` shape onto the metadata itself and each participant (zapo's native shape is `{ jid, ..., participants: [{ jid, isAdmin, isSuperAdmin }] }`) so permission checks and example commands across the codebase keep working unchanged. |
| `src/services/interactiveMessages.js` | Builds native `interactiveMessage` (native_flow) / `buttonsMessage` / `listMessage` payloads from the legacy `buttons` / `interactiveButtons` / `sections` / `cards` DSL — this is what used to require the Baileys binary patch. Carousel cards upload their images through `client.message.upload` before building the card. |

Rules:

- prefer extending `src/services/wa.js` / `src/services/interactiveMessages.js` over
  reaching for the raw zapo `client` (`socket.client`) inside a command — this keeps
  one consistent send-shape across the whole codebase
- `client.message.send` resolves to a `WaMessagePublishResult` (`{ id, ack }`), not a
  Baileys-style `{ key: { id } }` — the adapter synthesizes `.key` on every return
  value for backward compatibility (see `attachBaileysStyleKey` in `wa.js`); don't
  strip it when touching the adapter
- entry/exit of group members is **not** a message event anymore — it's the
  `group` event (`client.on("group", ...)`, handled in `src/loader.js`), not a
  `messageStubType` on a message like it was under Baileys

## HOSTING_AND_PTERODACTYL

The project README currently highlights the supported hosts in its installation section.
Treat `README.md` as the source of truth for host names and links.

Installation tutorials stay in `README.md`.

If the topic is about hosting, VPS setup, startup configuration, schedules, SFTP, Pterodactyl panel usage, or backup flow, agents should also load:

- `.agents/skills/pterodactyl-specialist/SKILL.md`

That skill is the specialized source for Pterodactyl guidance.

## STABILITY_AND_ERRORS

Stability mechanisms:

- `DEVELOPER_MODE` in `src/config.js` increases logging
- runtime logs are stored in `assets/temp/wa-logs.txt`
- `src/utils/badMacHandler.js` helps recover from repeated session failures
- TIMEOUT_IN_MILLISECONDS_BY_EVENT throttles event execution

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

- `.agents/skills/*`

Current local skill:

- `pterodactyl-specialist` → focused instructions for Pterodactyl panel usage, hosting workflows, files, databases, backups, schedules, bots, and APIs

Skill usage rule:

- if the topic is about hosting or **Pterodactyl**, load `.agents/skills/pterodactyl-specialist/SKILL.md`

This keeps support and agent workflows selective instead of forcing every answer to carry all hosting knowledge by default.

## DOESN'T RUNS

Do not run `npm test` or `npm start` in this repository.
