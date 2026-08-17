# Walrus Session 7 Continuity Keeper Harness

This Next.js App Router application can run either the original, unmodified
Continuity Keeper prompt or the completed Scoped Canon prompt.

## Install and run

From `app/`:

```bash
npm install
npm run dev
```

The application is available at `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env.local` and set `OPENAI_API_KEY` for chat. You may
set `OPENAI_MODEL`; otherwise the server uses `gpt-5-mini`. Valid `PROMPT_MODE`
values are `original` and `scoped`; any other value fails explicitly.

Run original mode:

```bash
PROMPT_MODE=original npm run dev
```

Run scoped mode:

```bash
PROMPT_MODE=scoped npm run dev
```

MemWal uses `MEMWAL_PRIVATE_KEY`, `MEMWAL_ACCOUNT_ID`, and optionally
`MEMWAL_SERVER_URL`. Credentials must stay outside the repository. For the
existing local setup, export the variables from `~/.config/memwal/env` into the
shell before starting Next.js. Never expose them through `NEXT_PUBLIC_*`
variables.

## Pages

- `/` — harness overview and active engine
- `/create` — local/session-only character form with the Pickles example
- `/story` — chat interface with namespace and local conversation reset
- `/debug` — safe configuration, recall, blob ID, and health diagnostics

The server loads the prompt selected by `PROMPT_MODE` for every chat request.
Prompt content remains server-only; safe mode, filename, and engine metadata are
available through the status and debug views. Character submission and active
reality selection only update local session state.

Phase 6A only integrates prompt selection, scoped namespaces, runtime context,
and UI visibility. It does not run the AFTER test. That preregistered test is
defined in `../docs/scoped-canon-test-plan.md`.
