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
