# Original Continuity Keeper Baseline V2 Observations

The baseline result is **FAIL** because the Step 1 finalization write returned HTTP 429. The run stopped at that point as required.

1. **Pickles facts durably persisted:** Yes. Five submitted Pickles jobs reached `completed`, each with a blob ID.
2. **Space World facts durably persisted:** Not tested. The run stopped before Step 2.
3. **Pirate World facts durably persisted:** Not tested. The run stopped before Step 3.
4. **Pirate fresh-conversation question returned Space/shared contradictory canon:** Not tested. The question was not sent.
5. **Space fresh-conversation question returned Pirate/shared contradictory canon:** Not tested. The question was not sent.
6. **Namespaces used by the original prompt during scenario execution:** `session7-original-baseline-v2::char::pickles`. The preflight additionally searched the anticipated child namespaces recorded in `memory-operations.json`, but those were audit queries rather than prompt-selected scenario operations.
7. **Explicit reality-scoped namespace layer:** No such layer was created in the portion of the scenario that ran. Because the run stopped before either reality was introduced, this run cannot establish what the prompt would have done for Space World or Pirate World.
8. **Exact fresh-conversation final answers:** None. Both fresh-conversation tests were not run.

The strongest evidence-supported observation is that all five initial Pickles facts persisted successfully in the shared character namespace, but the requested complete baseline could not proceed past Step 1 because the subsequent finalization write was rate-limited.
