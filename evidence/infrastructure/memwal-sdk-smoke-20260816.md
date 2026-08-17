# MemWal Managed SDK Smoke Test — 2026-08-16

## Environment

- SDK version: `@mysten-incubation/memwal` `0.1.1`
- Managed relayer URL: `https://relayer.memory.walrus.xyz`
- Health result: `{"status":"ok","version":"0.1.0","relayerVersion":"0.1.0","apiVersion":"1.0.0","minSupportedSdk":{"typescript":"0.0.4","python":"0.1.0","mcp":"0.0.1"},"featureFlags":{"auth.accountBoundNonce":true,"auth.sealSessionHeader":true,"config.publicDeploymentMetadata":true,"remember.asyncJobs":true,"remember.bulk":true,"runtime.versionEndpoint":true},"deprecations":[{"surface":"header:x-delegate-key","deprecatedSince":"1.0.0","removalApiVersion":"2.0.0","guidance":"Use x-seal-session for relayer-managed SEAL decrypt flows; manual-mode requests should send no decrypt credential."},{"surface":"env:SEAL_KEY_SERVERS","deprecatedSince":"1.0.0","removalApiVersion":"2.0.0","guidance":"Use SEAL_SERVER_CONFIGS so independent and committee key-server configs share one JSON schema."}],"build":{"commit":"3ca4b4c0ff41976a4190a08783234e0c549d2a53"},"mode":"production","prompt_versions":{"extract":"extract.v6","ask":"ask.v2"}}`
- `MEMWAL_PRIVATE_KEY`: PRESENT
- `MEMWAL_ACCOUNT_ID`: PRESENT
- `MEMWAL_SERVER_URL`: PRESENT
- Credential values: not recorded

## Test 1

- Namespace: `session7-sdk-smoke-20260816-01`
- Memory: `Session 7 direct SDK smoke test number one.`
- Job ID: `01b59664-2fb2-4e5e-bdab-1eaf0f133232`
- Final state: `done`
- Blob ID: `Q0VoKt9AmjqNu78-KnrWPplJNUDiqYBw3EdSqNMlA5Q`
- Recall result: `Session 7 direct SDK smoke test number one.`
- Recall blob ID: `Q0VoKt9AmjqNu78-KnrWPplJNUDiqYBw3EdSqNMlA5Q`
- Distance: `0.2228291798982065`
- Exact error: none
- Classification: `PASS`

## Test 2

- Namespace: `session7-sdk-smoke-20260816-02`
- Memory: `Session 7 direct SDK smoke test number two.`
- Job ID: `5f1428aa-be3e-4bba-8ffb-e7e77cfc1c9e`
- Final state: `timeout` (the last observed SDK status was nonterminal)
- Blob ID: none
- Recall result: not attempted because the write did not complete
- Recall blob ID: none
- Distance: none
- Exact error: `Internal Error: durable Walrus upload failed (503 Service Unavailable): {"error":"Unable to perform gas selection due to insufficient SUI balance (in address balance or coins) for account 0xb7d94c445d8c6fe9e477c90b5a172b648611b4c0295de5a6584bb3aaaab30746 to satisfy required budget 7178792.","code":"NO_SIDE_EFFECT","traceId":"5a70c73e-e2b0-4c42-9fe2-cfa3561afc88"}`
- Classification: `WRITE_TIMEOUT`

## Test 3

- Namespace: `session7-sdk-smoke-20260816-03`
- Memory: `Session 7 direct SDK smoke test number three.`
- Job ID: `964d493f-d91e-43be-8e5b-4a4eab5954c1`
- Final state: `timeout` (the last observed SDK status was nonterminal)
- Blob ID: none
- Recall result: not attempted because the write did not complete
- Recall blob ID: none
- Distance: none
- Exact error: `Internal Error: durable Walrus upload failed (503 Service Unavailable): {"error":"Unable to perform gas selection due to insufficient SUI balance (in address balance or coins) for account 0x800ff2ea234bcab45e42f20bed8d539cc4c9bbf2da4a468ee29bc8d58a325942 to satisfy required budget 7178792.","code":"NO_SIDE_EFFECT","traceId":"71d92fb5-d639-4b21-9208-c0c57843900d"}`
- Classification: `WRITE_TIMEOUT`

## Summary

Pass count: 1/3

Failure classifications:

- `WRITE_TIMEOUT`: 2
- `WRITE_FAILED_GAS`: 0
- `WRITE_FAILED_SEAL_SIDECAR`: 0
- `WRITE_FAILED_OTHER`: 0
- `WRITE_COMPLETED_RECALL_FAILED`: 0

Direct managed-SDK persistence was inconsistent across three independent sequential writes. Two writes remained nonterminal through the three-minute timeout, and their last observed statuses contained managed-relayer durable-upload gas-selection errors reporting insufficient SUI. No Seal-sidecar failure was returned in this test.
