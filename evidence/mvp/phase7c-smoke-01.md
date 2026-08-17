# DEVELOPMENT SMOKE TEST — NOT REAL USER USAGE

- Timestamp: 2026-08-17T11:15:37-04:00
- Prompt mode: `scoped`
- OpenAI model: `gpt-5.6-luna`
- Story namespace: `story-session7-phase7c-smoke-01`
- Disposable character: Testy — a small blue robot
- Disposable world: Test Garden — a garden filled with giant flowers

## Storyteller opening

> Testy rolled into the Test Garden, where giant flowers towered high above like colorful umbrellas. A red tulip gently swayed, a yellow daisy giggled in the breeze, and a purple lily glowed near the garden path.
>
> Suddenly, a tiny silver seed bounced right into Testy’s hands.
>
> “Beep!” said Testy. The seed began to wiggle. Then it pointed toward a dark tunnel beneath the biggest flower.
>
> From inside came a soft sound: **tap… tap… tap…**
>
> Testy’s blue lights blinked with curiosity.
>
> Should Testy enter the flower tunnel?

- Request action: `continue`
- Write tools enabled: NO
- Durable writes: 0
- Deterministic preload: two CORE and five `test-garden` ACTIVE REALITY namespaces; all returned empty and no unrelated reality was queried.

## Child choice

Exact child message: `Testy climbs the biggest flower.`

> Testy gripped the biggest flower’s thick green stem and began to climb.
>
> Up, up, up went the little blue robot! The petals were as wide as trampolines, and each one bounced gently beneath Testy’s metal feet.
>
> At the very top, Testy discovered a tiny golden door hidden inside the flower’s center. A sign blinked:
>
> **KNOCK THREE TIMES**
>
> Testy raised one shiny finger.
>
> Should Testy knock on the golden door?

- Request action: `continue`
- Write tools enabled: NO
- Durable writes: 0
- Recall remained limited to CORE and `test-garden` ACTIVE REALITY.

## Save This Part

- Button-equivalent action sent exactly once: `finalize`
- Write tools enabled: YES
- Candidate classifications submitted to the write tool: three REALITY candidates
- Candidates and exact namespaces:
  - `[canon:place] biggest flower — the largest flower in Test Garden; Testy climbed its stem to the top (as of: flower-top scene)` → `story-session7-phase7c-smoke-01::reality::test-garden::place::biggest-flower`
  - `[canon:char] Testy — a small blue robot at the top of the biggest flower (as of: flower-top scene)` → `story-session7-phase7c-smoke-01::reality::test-garden::char::testy`
  - `[canon:object] golden door — a tiny golden door hidden in the center of the biggest flower; its sign instructs visitors to knock three times (as of: flower-top scene)` → `story-session7-phase7c-smoke-01::reality::test-garden::object::golden-door`
- Exact-candidate dedup recalls for those three candidates returned no duplicates.
- Other candidate dedup recalls began failing with HTTP 429 and were not submitted for writing.
- `remember_bulk` result: HTTP 429, `30 weighted-requests/min`, retry after 60 seconds
- Job IDs: none accepted
- Job states: none
- Blob IDs: none
- Result: FAIL. No durable candidate reached successful terminal completion. Save was not repeated.

## Post-save continuation

Exact child message: `What happens next?`

> Testy tapped the golden door three times.
>
> **Tap! Tap! Tap!**
>
> The door popped open, and a swirl of warm, sparkly air lifted Testy into the flower’s glowing center. Inside was a tiny room filled with floating seeds.
>
> One seed wore a little silver crown.
>
> “I am the Garden Keeper,” it said. “Our moonflower has lost its song. Can you help find it?”
>
> Just then, from far below, came a faint musical **ding**.
>
> Testy looked down. The sound was coming from the dark tunnel beneath the flower.
>
> Should Testy follow the music down into the tunnel, or search the flower’s top first?

- Request action: `continue`
- Write tools enabled: NO
- Durable writes: 0
- Story continuation: PASS
- Canon preload calls: attempted only CORE plus `test-garden`, but all received the same HTTP 429 and no canon was fabricated.

## Temporary history and Debug

- Expected scoped history key: `walrus-s7-story-history:session7-phase7c-smoke-01:test-garden`
- Expected scoped conversation key: `walrus-s7-conversation:session7-phase7c-smoke-01:test-garden`
- Character/world key isolation is structurally verified.
- Live browser restoration was not verified because this execution environment has no browser binary; the smoke flow used the exact Story Mode API contract.
- The returned debug payload exposed selected metadata, request action, preload namespaces/results/errors, write-tool state, candidates, and write error without secrets. No submitted job or blob ID existed to display.

## Result

Phase 7C: **FAIL**. Storytelling and hard write gating passed, but the one permitted finalization was rate-limited before any memory job was accepted. This is development smoke-test data, not Phase 8 or real-user usage.

## Retry after rate-limit window

- Retry timestamp: 2026-08-17 at approximately 11:24 EDT
- Wait interval: more than 7 minutes after the prior rate-limited request (minimum required: 65 seconds)
- Action: `finalize`, invoked exactly once
- Write tools enabled: YES
- Conversation reused: the preserved Testy/Test Garden opening, `Testy climbs the biggest flower.`, and golden-door discovery; no new story content was created
- Scoped workflow: the finalize request completed and returned one or more nonterminal jobs, causing the job-status polling branch to run
- Scope: story `story-session7-phase7c-smoke-01`, ACTIVE REALITY `test-garden`; no unrelated reality was requested
- Candidates/namespaces: the retry response was held by the smoke runner while polling. Its first job-status request failed before the runner emitted that response, so exact retry candidate and namespace records were not recoverable. The original attempt's candidates and exact namespaces remain recorded above.
- Job IDs: returned to the smoke runner but not recoverable after the polling exception
- Job states: submitted/nonterminal at initial response; terminal state unavailable
- Blob IDs: unavailable
- Error: the first read-only `/api/memwal/jobs` poll returned HTTP 429, `30 weighted-requests/min`, retry after 60 seconds
- Save result: **INCONCLUSIVE_RATE_LIMIT**. No second retry or additional write attempt was made.
- Temporary-history restoration: **FAIL (not executable in this environment)**. No browser runtime is installed, and the original smoke flow used the Story Mode API directly, so it did not create a browser `sessionStorage` record to navigate away from and restore.
- Expected isolated keys remain `walrus-s7-story-history:session7-phase7c-smoke-01:test-garden` and `walrus-s7-conversation:session7-phase7c-smoke-01:test-garden`.
- Exact cause: absence of a browser session containing the prior transcript, not a proven application defect.
- Smallest required follow-up: no code change; perform the read-only away-and-back check in a browser that owns the Testy/Test Garden session.

## Final read-only persistence verification

- Verification timestamp: 2026-08-17T11:28:24-04:00; more than 90 seconds after the last rate-limited request
- New writes: 0
- Save persistence: **PASS** — one appropriate finalized-story memory is durably recallable
- Query: `[canon:place] biggest flower — the largest flower in Test Garden; Testy climbed its stem to the top (as of: flower-top scene)`
  - Namespace: `story-session7-phase7c-smoke-01::reality::test-garden::place::biggest-flower`
  - Result: no memory returned
- Query: `[canon:char] Testy — a small blue robot at the top of the biggest flower (as of: flower-top scene)`
  - Namespace: `story-session7-phase7c-smoke-01::reality::test-garden::char::testy`
  - Memory: `[canon:char] Testy — climbed to the top of the biggest flower and is standing beside its hidden golden door (as of: finalized scene)`
  - Blob ID: `bnhhUy_-iKXUdeTuW3K0reed_kaagrOoPn3YvCWTWD8`
  - Distance: `0.2115448408288948`
- Query: `[canon:object] golden door — a tiny golden door hidden in the center of the biggest flower; its sign instructs visitors to knock three times (as of: flower-top scene)`
  - Namespace: `story-session7-phase7c-smoke-01::reality::test-garden::object::golden-door`
  - Result: no memory returned
- Errors: none
