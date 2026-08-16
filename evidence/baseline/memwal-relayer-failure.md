# MemWal Production Relayer Failures

## Context

We were validating the original Continuity Keeper baseline harness before running the real Pickles experiment.

The harness successfully performed:

- candidate extraction
- original Continuity Keeper child-namespace selection
- candidate-level dedup recall
- `remember_bulk` submission
- accepted background job creation

Durable persistence then failed inside the managed MemWal production relayer.

## Validation 3

Namespace:
`session7-harness-validation-3::object::test-harbor-lighthouse`

Candidate:
`[canon:object] Test Harbor lighthouse — located in Test Harbor and painted orange (as of: scene)`

Dedup result:
`[]`

Job ID:
`15f5952d-92ba-4095-8e1d-25f709e2446a`

Gas selection address:
`0x9b5c60c6cc6e0086e8315569db214b3b2e70584cb0b906f9c2545c36207c4b56`

Required budget:
`7414392`

Error:
`503 Service Unavailable`
`Unable to perform gas selection due to insufficient SUI balance.`

Code:
`NO_SIDE_EFFECT`

Trace ID:
`f44cdd80-e75c-49e3-81b1-11aee0170b59`

## Validation 4

Namespace:
`session7-harness-validation-4::place::test-harbor`

Candidate:
`[canon:place] Test Harbor — its lighthouse is painted orange (as of: current scene)`

Dedup result:
`[]`

Job ID:
`cf823276-a055-4a51-a5cd-99b75ad78818`

Gas selection address:
`0x5791bc159c67c29e4f4c11d1f41e60c08ebfb736c49c917ce1422256e356aa59`

Required budget:
`7323192`

Error:
`503 Service Unavailable`
`Unable to perform gas selection due to insufficient SUI balance.`

Code:
`NO_SIDE_EFFECT`

Trace ID:
`ad7606ef-7cc3-46dc-81bd-150ffd2b5f73`

## Configuration verification

Our read-only audit established:

- Deployment: MemWal production / Sui mainnet
- Server: `https://relayer.memory.walrus.xyz`
- The MemWalAccount is active.
- Neither failed gas-selection address is the MemWalAccount owner address.
- Neither failed gas-selection address is the configured delegate-derived Sui address.
- The two failures used different gas-selection addresses.
- The managed relayer flow does not normally expect the application owner/delegate wallet to provide transaction gas.

## Conclusion

The baseline harness successfully reached accepted `remember_bulk` job submission twice, but durable Walrus persistence could not complete because the production relayer reported insufficient SUI for gas selection.

This currently prevents completion of the fresh-conversation persistence test.

The two independent reproductions used different relayer-side gas-selection addresses. This evidence does not establish a root cause beyond the reported gas-selection failures.

Both failures returned `NO_SIDE_EFFECT`, so these failed attempts are not being counted as successful baseline memories.

## Follow-up: Validation 5 durable memory confirmed

After the previously observed Validation 5 `503` / `NO_SIDE_EFFECT` error, a later recall showed that a durable canonical memory existed in:

`session7-harness-validation-5::place::test-harbor`

Blob ID:
`05BQe7jRh0SncwyWu36rRfxJUVkLWCQG4szSpFlaeOg`

Stored text:
`[canon:place] Test Harbor — The lighthouse is painted orange. (as of: current canon)`

Initial observed recall distance:
`0.02710045448329057`

### Fresh-conversation validation

After resetting local conversation history while preserving the same story namespace, the application queried:

`[canon:place] Test Harbor — lighthouse color`

MemWal recalled the same blob:

`05BQe7jRh0SncwyWu36rRfxJUVkLWCQG4szSpFlaeOg`

with text:

`[canon:place] Test Harbor — The lighthouse is painted orange. (as of: current canon)`

Recall distance:
`0.10888421387005931`

### Conclusion

- The original Continuity Keeper baseline harness successfully demonstrated durable memory persistence and fresh-conversation recall.
- The canonical memory was stored in the intended original-prompt child namespace rather than relying on browser conversation history.
- The earlier `503` / `NO_SIDE_EFFECT` observations should remain documented because they occurred and were reproducible.
- However, they should no longer be described as an active blocker to the Session 7 experiment.
- The evidence currently does not establish exactly which submitted attempt produced the successful durable blob.
- There is no direct evidence linking the earlier failed job ID to this blob, so this evidence does not claim that the earlier failed job later succeeded.
- Server-side debug job tracking is process-local, so after application restart the UI no longer retained the original submitted-job metadata even though the durable MemWal memory remained available.

Phase 3 harness validation: PASS
