# Architecture

## MVP Concept

- One persistent character can exist in multiple independent realities.
- Character Core memory contains facts inherited across realities.
- Each Reality has an isolated memory scope.
- Runtime story context is Character Core + Active Reality only.
- Unrelated realities must not be retrieved.
- Story interactions may create:
  - `CORE`
  - `REALITY`
  - `EVENT`
  - `CORE_CANDIDATE`
  - `TRANSIENT`
- `CORE_CANDIDATE` facts require confirmation before promotion to Character Core.
- Walrus blobs are immutable writes; the application treats characters and realities as logical memory spaces that may contain multiple blobs over time.

The working name for the prompt evolution is **Scoped Canon**.

The original Continuity Keeper must remain preserved unchanged for the baseline experiment.

## Phase 2 Baseline Harness

The runnable application lives in `app/` and uses Next.js App Router,
TypeScript, React, and Tailwind CSS. It loads the original prompt from the
repository at request time; `PROMPT_MODE` rejects every value except
`original`.

All OpenAI and MemWal operations are server-only. The OpenAI integration uses
the Responses API and passes the unmodified prompt as system instructions. The
MemWal integration uses the installed TypeScript SDK directly because it
provides typed health, recall, and write results without requiring a persistent
stdio MCP child process inside Next.js. Credentials are supplied only through
server environment variables.

The public application exposes MemWal health and recall, but no write route.
The reusable server wrapper contains a future explicit `remember` method and
returns the SDK result containing `blob_id`; no application flow invokes it.
Character and conversation state are browser-session state only.
