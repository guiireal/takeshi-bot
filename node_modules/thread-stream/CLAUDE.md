# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Test Commands

```sh
npm test                    # Run linter (standard), type check, transpile, and all tests
npm run build               # Type check only (tsc --noEmit)
npm run transpile           # Generate transpiled test files for various ES targets

# Run a single test file
npx tap test/base.test.js

# Run only JavaScript tests (faster)
npx tap "test/**/*.test.*js"

# Run only TypeScript tests
npx tap --ts test/*.test.*ts
```

## Code Style

This project uses [Standard](https://standardjs.com/) for linting. No semicolons, 2-space indentation.

## Architecture

thread-stream is a library for streaming data to a Node.js Worker Thread using SharedArrayBuffer for high-performance inter-thread communication.

### Core Components

- **index.js** - Main `ThreadStream` class extending EventEmitter. Manages the worker lifecycle, handles writes via SharedArrayBuffer, and coordinates synchronization using Atomics.

- **lib/worker.js** - Runs in the Worker Thread. Loads the user-provided destination module, reads data from SharedArrayBuffer, and writes to the destination stream. Handles both ESM and CommonJS modules, including yarn PnP compatibility.

- **lib/indexes.js** - Defines SharedArrayBuffer index constants (`WRITE_INDEX`, `READ_INDEX`) used for Atomics coordination.

- **lib/wait.js** - Async polling utilities (`wait`, `waitDiff`) for cross-thread synchronization without blocking the main thread.

### Data Flow

1. Main thread writes strings to an internal buffer, then copies to SharedArrayBuffer
2. Atomics.notify signals the worker that data is available
3. Worker reads from SharedArrayBuffer via Atomics.load and writes to destination stream
4. Worker updates READ_INDEX and notifies main thread when done
5. Special index values (-1 for end, -2 for error) signal stream termination

### Key Features

- **Sync/async modes** - `sync: true` blocks until data is written; async mode uses `setImmediate` batching
- **Backpressure** - Handles `drain` events from destination streams
- **GC cleanup** - Uses FinalizationRegistry to terminate orphaned workers
- **TypeScript support** - Workers can be `.ts` files (requires ts-node)
