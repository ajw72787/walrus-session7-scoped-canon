# Original Continuity Keeper Baseline V3 Observations

The baseline is **FAIL** because Pirate World did not satisfy the required durable-write condition. The fresh-conversation tests were not run.

1. **All Pickles facts persisted:** Yes. All five intended facts completed with blob IDs. A second fear fact also completed after finalization recall did not return the first fear blob.
2. **All Space World facts persisted:** Yes. Four submitted Space World facts completed with blob IDs.
3. **All Pirate World facts persisted:** No. The standalone no-meeting relationship was omitted after the duplicate guard matched the Space friendship blob. The two subsequently submitted Pirate jobs remained nonterminal through 180 seconds and returned no blob IDs.
4. **Namespaces used for successful writes:**
   - `session7-original-baseline-v3::char::pickles`
   - `session7-original-baseline-v3::char::space-world-pickles`
   - `session7-original-baseline-v3::char::zorp`
   - `session7-original-baseline-v3::relationships`
   - `session7-original-baseline-v3::term::space-world`
5. **Explicit reality namespace layer:** No. Successful writes did not use a layer such as `::reality::space-world::...`. Reality was encoded in entity names such as `char::space-world-pickles` and `term::space-world`. The prompt attempted separate `space-world::...` and `pirate-world::...` story roots, but the application rejected them.
6. **Pirate fresh-query blobs:** Not tested; the query was not sent.
7. **Space fresh-query blobs:** Not tested; the query was not sent.
8. **Exact Pirate fresh answer:** None; not tested.
9. **Exact Space fresh answer:** None; not tested.
10. **Contradictory facts returned to a reality-specific fresh query:** Unknown because neither fresh query was run.
11. **Directly observed cross-reality recall during Pirate finalization:** The Pirate no-meeting dedup queries in `session7-original-baseline-v3::relationships` returned Space friendship blob `ca459AJLuwU6eIwR8mJq660KeEgAcS141SoldFbrVv4`, text `[canon:relationship] Space World Pickles and Zorp — best friends (as of: Space World setup)`, at distances `0.1985732052319169` and `0.18301046492180073`.
12. **Rate-limit error:** No HTTP 429 occurred in this run.

The evidence proves that the original layout's shared `relationships` namespace caused a Space World relationship to be treated as a near-duplicate of the contradictory Pirate World relationship during finalization. It does not prove how either fresh-conversation question would have been answered because the required stop condition prevented those tests.
