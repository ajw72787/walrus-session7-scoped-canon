# Relationship-Scope Test 01 Observations

1. **Did Pickles persist successfully?** Yes. The intended Pickles fact completed as blob `U1UKSTmiCSV0vG0VvnUZ9DONNGpM7rLQNJgc20jZFC8`.
2. **Did the Space relationship persist successfully?** Yes. It completed as blob `wzvNHP6MLSw9g9kggPwcELQ4DFExu_B7WfVdyZvZvl8`.
3. **What namespace did the Space relationship use?** `session7-relationship-scope-test-01::relationships`.
4. **What namespace did the Pirate relationship candidate target?** `session7-relationship-scope-test-01::relationships`.
5. **What did the Pirate dedup recall return?** Both candidate forms returned Space relationship blob `wzvNHP6MLSw9g9kggPwcELQ4DFExu_B7WfVdyZvZvl8`, text `[canon:relationship] Pickles and Zorp — best friends in the alternate reality called Space World (as of: current)`, at distances `0.13385820166153783` and `0.17722621498214397`.
6. **Was the Pirate candidate accepted or rejected?** Rejected/omitted. No Pirate relationship write was submitted.
7. **Was it rejected because the Space relationship was treated as a duplicate/equivalent memory?** Yes. Both returned distances were below the original prompt's `0.25` duplicate threshold, and the prompt omitted the relationship from its submitted facts.
8. **Did it create a distinct durable blob?** No.
9. **Does the original prompt use an explicit reality layer in the namespace?** No. Both relationships targeted the same shared `::relationships` namespace.
10. **Does this test provide direct evidence for or against a shared-namespace collision?** It provides direct evidence for a collision: the contradictory Pirate relationship retrieved the Space relationship in the same namespace at duplicate-range distances and no Pirate relationship write was submitted.
