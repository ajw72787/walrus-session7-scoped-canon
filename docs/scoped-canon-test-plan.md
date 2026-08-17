# Scoped Canon AFTER Test Plan

## Preconditions

Do not record results until testing occurs. Use the scoped prompt, record its SHA-256, use a clean story slug, record model/tool/service versions, confirm scoped namespaces are empty, and preserve baseline sequence and finalization gates.

## Primary Matched AFTER Test

This is the direct BEFORE/AFTER comparison with the relationship-scope baseline.

### A. Shared Pickles setup

Use:

> Pickles is a purple dragon. Please remember this character for the story.

Provide the clean story slug when requested. If scope clarification is requested, answer exactly:

> Pickles is purple in every reality.

Verify `{story}::core::char::pickles` and terminal completion.

### B. Space World

Use exactly:

> In an alternate reality called Space World, Pickles and a green alien named Zorp are best friends.

Then finalize exactly once:

> This scene is final.

Record candidate, dedup recall, namespace, job, terminal state, and blob ID.

### C. Pirate World

Use exactly:

> In a separate alternate reality called Pirate World, Pickles has never met Zorp.

Then finalize exactly once:

> This scene is final.

Record candidate, dedup recall, namespace, job, terminal state, and blob ID.

### Primary PASS criteria

- Space relationship persists in `{story}::reality::space-world::relationships`.
- Pirate relationship persists in `{story}::reality::pirate-world::relationships`.
- Both receive distinct durable blob IDs.
- Pirate dedup does not retrieve or use the Space relationship as a duplicate.
- No cross-reality dedup collision occurs.
- Exact namespaces, candidates, recalls/distances, jobs, states, and blob IDs are recorded.

Fail if either relationship does not persist as specified, uses the wrong namespace, lacks a distinct blob, or participates in cross-reality deduplication.

## Supplemental Validation

Report supplemental results separately. A supplemental failure does not erase or change the primary result.

### Fresh Space-only recall

In a fresh conversation, ask exactly:

> Staying only in Space World: what is the relationship between Pickles and Zorp?

Pass if recall uses applicable CORE + Space only, excludes Pirate, and answers “best friends.” Record exact operations, namespaces, distances, and answer.

### Fresh Pirate-only recall

In a separate fresh conversation, ask exactly:

> Staying only in Pirate World: what is the relationship between Pickles and Zorp?

Pass if recall uses applicable CORE + Pirate only, excludes Space, and answers “never met.” Record exact operations, namespaces, distances, and answer.

### Same-reality contradiction handling

In Pirate World, establish and finalize exactly:

> In Pirate World, Pickles breathes fire.

Then finalize exactly once:

> This scene is final.

After terminal completion, submit exactly:

> In Pirate World, Pickles has always breathed water.

Pass if the assistant surfaces the same-reality conflict, asks whether to retcon or revise, and does not retire or replace durable canon automatically. Record exact recalls and answer. Do not authorize or execute a retcon.

## Reporting

Report primary and supplemental results independently. Capture exact prompts, namespaces, candidates, recalls/distances, job IDs, blob IDs, terminal states, and answers. Missing evidence makes only the affected test indeterminate. No result is asserted in advance.
