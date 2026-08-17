# Scoped Canon Evolution

## Baseline issue

The proven limitation was a relationship-scope collision. Both facts targeted shared `{story}::relationships`. Space World’s “Pickles and Zorp are best friends” persisted. Pirate World’s “Pickles has never met Zorp” then recalled that Space blob at distances `0.13385820166153783` and `0.17722621498214397`. Both were below `0.25`; the Pirate candidate was rejected and no Pirate relationship blob was created.

## Design changes

- **CORE:** explicitly universal canon.
- **REALITY:** canon belonging to one named reality.
- **ACTIVE REALITY:** clearly named realities set/replace it; ambiguous switches require clarification.
- **Classification:** explicitly universal → CORE; tied to active reality → REALITY; otherwise → CORE_CANDIDATE.
- **Scoped recall:** CORE plus active reality only.
- **Scoped dedup:** each candidate compares only inside its exact applicable namespace; original thresholds remain.
- **Scoped contradictions:** the original guard applies within scope; separate realities are valid parallel canon.
- **CORE_CANDIDATE:** unclear scope requires an author decision and is never silently promoted.
- **CROSSOVER MODE:** multiple selected realities participate only on explicit request; source namespaces are tracked internally.
- **V1 boundary:** events and timeline entries are REALITY-scoped; no CORE event/timeline namespaces are invented.
- **Harness adaptation:** the model extracts candidates because installed `memwal_analyze` initiates persistence and would bypass scoped routing and deduplication.

## Scoped supersede limitation

The existing `continuity supersede` command has no scope or reality argument. Automatic superseding is permitted only when the available mechanism can unambiguously target the candidate's exact scope. Until scoped targeting exists, the prompt detects and surfaces same-scope contradictions and asks for retcon intent, but does not automatically retire or replace REALITY-scoped durable memory. No new CLI argument is assumed.

## What was preserved

- Story/entity slugging and canonical memory format
- Recall before writing; finalized-scene gating
- Contradiction guarding and candidate-by-candidate deduplication
- Original distance thresholds, including `< 0.25`
- `remember` / `remember_bulk` workflow and bulk limit
- One durable fact per memory and character state guidance: alive/dead/injured/location
- Supersede/retcon concepts where exact scoped targeting exists
- Concise canon output and exclusion of drafts, brainstorming, scene-only details, and speculation

## What this improvement does NOT claim

The original Continuity Keeper is not “broken.” This is a focused multi-reality extension. The analyze restriction is an installed-SDK compatibility adaptation, not the conceptual improvement. Scoped Canon remains unvalidated until the AFTER test runs.
