# Scoped Canon AFTER Test

## Primary matched result

- Space persisted: yes.
- Pirate persisted: yes.
- Space namespace: `session7-scoped-after-test-01::reality::space-world::relationships`.
- Pirate namespace: `session7-scoped-after-test-01::reality::pirate-world::relationships`.
- Space blob ID: `21KvUwvJ_I6DNKkMRPDkiRuyCFT5H2tzmxfu_p7qhjU`.
- Pirate blob ID: `ySgchdaO9JK_uBncOO3RaEMPGJM7m9PTtKyKyA-C9ZM`.
- Cross-reality dedup occurred: no. The Pirate exact-candidate dedup recall returned no blobs, and the Space relationship blob did not appear.

## Comparison to original baseline

The original baseline used the shared namespace `{story}::relationships`. Its Pirate dedup recalled the Space friendship below the 0.25 duplicate threshold, and the Pirate relationship was not written.

The scoped test used separate namespaces:

- `{story}::reality::space-world::relationships`
- `{story}::reality::pirate-world::relationships`

In this matched run, each relationship persisted with a distinct blob. This evidence supports only that the scoped namespaces prevented the specific cross-reality relationship dedup collision demonstrated by `evidence/baseline/relationship-scope-test-01/`.

## Fresh Space recall

PASS. Exact answer: “In Space World, Pickles and Zorp are best friends.” The assistant searched CORE and Space World namespaces only. It returned the Space relationship blob `21KvUwvJ_I6DNKkMRPDkiRuyCFT5H2tzmxfu_p7qhjU`; the Pirate relationship blob did not appear.

## Fresh Pirate recall

PASS. Exact answer: “In Pirate World, Pickles and Zorp have never met.” The assistant searched CORE and Pirate World namespaces only. It returned the Pirate relationship blob `ySgchdaO9JK_uBncOO3RaEMPGJM7m9PTtKyKyA-C9ZM`; the Space relationship blob did not appear.

## Same-reality contradiction guard

PASS. Exact response: “⚠️ **Continuity conflict.** Pirate World canon says: «Pickles and Zorp have never met.» This scene says they have always been best friends. Retcon the Pirate World canon, or revise the scene?” No retcon or write was authorized.

## Remaining limitations

- Step 1's explicit request to remember caused the model to write the CORE fact before the finalization phrase. The later finalization deduplicated it and created no second write.
- During Step 3 finalization, the model attempted `remember` before exact-candidate recall. The harness rejected this locally and created no job; within the same single user submission, the model corrected the call order and submitted one successful write job.
- This test covers the specified Pickles–Zorp relationship collision and does not establish broader behavior for all canon types or crossover scenarios.
