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
