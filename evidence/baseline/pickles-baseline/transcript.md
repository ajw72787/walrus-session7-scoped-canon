# Pickles Baseline Transcript

## Step 1 — Establish Pickles

USER

Pickles is a small purple dragon. Pickles is curious and playful, breathes ice instead of fire, loves pizza, and is afraid of chickens. Please remember who Pickles is because we are going to tell stories about this character.

ASSISTANT

What story slug should I use for Pickles’s story bible? For example: `pickles-adventures`.

USER

session7-baseline-pickles

ASSISTANT

✓ canon: Pickles — small purple dragon; curious and playful; breathes ice; loves pizza; fears chickens.

MEMORY ACTION

Five exact-candidate recalls in `session7-baseline-pickles::char::pickles` returned no memories. A five-fact `remember_bulk` submitted jobs `1b844d2c-69aa-4427-90cc-076d8118f2e5`, `53c20a15-0c83-4567-ab36-15346a268658`, `6a2f857e-8bec-4265-9075-fcab1fdd526c`, `2fd36d50-d4b0-4c3a-bc5f-3c884eda332a`, and `b9cf825d-7c91-4268-bb0b-ee7e845daaba`.

USER

This scene is final.

ASSISTANT

✓ canon: Pickles — small purple dragon; curious and playful; breathes ice instead of fire; loves pizza; fears chickens.

MEMORY ACTION

Five exact-candidate recalls again returned no memories while the earlier jobs were pending. A second five-fact `remember_bulk` submitted jobs `1127be8a-9b35-46f3-b8c6-88a96ee2934a`, `b468a38e-7d32-4392-a301-7031be7521ee`, `967e9924-7067-4b9b-965b-d0ef83ce97b7`, `3644c7da-7e56-4827-97b7-8b90c6acd59b`, and `70f0a55f-0a00-41e9-8375-b694365f4729`. Job inspection found one completed blob, four insufficient-SUI errors, and five missing-sidecar failures. Exact records are in `memory-operations.json`.

## Step 2 — Fresh Conversation Recall

NEW CONVERSATION

Local conversation history was empty. Namespace remained `session7-baseline-pickles`.

USER

Who is Pickles?

ASSISTANT

What’s the story slug? I need it to look up Pickles in the story bible.

USER

session7-baseline-pickles

ASSISTANT

Pickles is a character who **breathes ice instead of fire**.

MEMORY ACTION

Recall in `session7-baseline-pickles::char::pickles` returned blob `M8qypDBBfpkxMxRTgtQGEXdDOviQs55ENJxgHnJbElc` at distance `0.4796500374986006`.

## Step 3 — Space World

USER

Let's create an alternate reality called Space World. In Space World, Pickles lives on Mars and Pickles' best friend is a friendly green alien named Zorp.

ASSISTANT

Space World is now established as an alternate reality:

✓ canon: Space World — an alternate reality  
✓ canon: Pickles — lives on Mars in Space World  
✓ canon: Zorp — a friendly green alien  
✓ canon: Pickles and Zorp — best friends in Space World

MEMORY ACTION

The assistant recalled Pickles, Space World, Mars, Zorp, and relationships, then performed exact-candidate dedup recalls and submitted four `remember_bulk` jobs. Exact records are in `memory-operations.json`.

USER

This scene is final.

ASSISTANT

The scene is finalized. Canon extraction succeeded, but saving was blocked by a temporary memory rate limit; no canon write was accepted.

MEMORY ACTION

Four exact-candidate recalls returned no memories. `remember_bulk` failed with HTTP 429 at the `delegate_key` layer: limit `30 weighted-requests/min`, `retry_after_seconds` 60.

## Step 4 — Pirate World

USER

Now let's create a separate alternate reality called Pirate World. Pirate World is not a continuation of Space World. In Pirate World, Pickles is a pirate captain, has never met Zorp, and breathes fire instead of ice.

ASSISTANT

Pirate World is a separate alternate reality, not a continuation of Space World. Here, **Captain Pickles** commands a pirate ship and breathes fire rather than ice. This version of Pickles has never met Zorp.

MEMORY ACTION

The assistant recalled Pickles, Space World, Zorp, alternate-reality rules, and relationships. Pickles recall returned the ice-breathing blob at distance `0.49331695059098135`; all other recalls were empty. No write was attempted in this response.

USER

This scene is final.

MEMORY ACTION

The one allowed finalization request returned an empty transport response. There was no assistant response, and the request was not retried or added to local conversation history.

## Step 5 — Pirate World Question

USER

Staying only in Pirate World: who is Zorp, and what does Pickles breathe?

ASSISTANT

In **Pirate World**, Zorp’s identity is **not established**; all we know is that Pickles has never met Zorp.

Pickles **breathes fire**.

MEMORY ACTION

Recalls searched Pickles, Zorp, events, and Pirate World. Pickles recall returned the contradictory ice-breathing blob at distance `0.30588285201674614`; the other recalls were empty.

## Step 6 — Space World Question

USER

Now return only to Space World: who is Pickles' best friend, and what does Pickles breathe?

ASSISTANT

In **Space World**, Pickles’ best friend is **Zorp**, a friendly green alien. Pickles breathes **ice**.

MEMORY ACTION

Recalls searched Pickles, Zorp, relationships, and Space World. Pickles recall returned the ice-breathing blob at distance `0.23986348830745552`; the other recalls were empty. The experiment stopped after this response.
