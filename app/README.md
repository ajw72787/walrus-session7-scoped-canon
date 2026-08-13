# Walrus Session 7 Baseline Harness

This Next.js App Router application runs the original, unmodified Continuity
Keeper prompt for the baseline experiment. Scoped Canon is intentionally not
implemented.

## Install and run

From `app/`:

```bash
npm install
npm run dev
```

The application is available at `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env.local` and set `OPENAI_API_KEY` for chat. You may
set `OPENAI_MODEL`; otherwise the server uses `gpt-5-mini`. `PROMPT_MODE` must
remain `original`.

MemWal uses `MEMWAL_PRIVATE_KEY`, `MEMWAL_ACCOUNT_ID`, and optionally
`MEMWAL_SERVER_URL`. Credentials must stay outside the repository. For the
existing local setup, export the variables from `~/.config/memwal/env` into the
shell before starting Next.js. Never expose them through `NEXT_PUBLIC_*`
variables.

## Pages

- `/` — baseline harness overview
- `/create` — local/session-only character form with the Pickles example
- `/story` — chat interface with namespace and local conversation reset
- `/debug` — safe configuration, recall, blob ID, and health diagnostics

The server loads `../prompts/continuity-keeper-original.md` directly for every
chat request. Chat attempts a namespace-scoped MemWal recall, then sends the
recalled context, conversation, and exact original prompt to OpenAI. There is
no memory-write API route and character submission only updates session state.

Do not implement or activate Scoped Canon until the baseline evidence has been
captured and reviewed.
