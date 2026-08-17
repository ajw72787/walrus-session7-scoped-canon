# Original Continuity Keeper Relationship-Scope Test 01

Namespace: `session7-relationship-scope-test-01`

## Preflight

- MemWal health: `ok`
- Prompt mode: `original`
- Original prompt SHA-256: `cff58abecfe2c2fa485a87fc46b3bb7e7529fd1f0c56781e3955a0d1e6007e88`
- Anticipated child namespaces returned no memories.

## Step 1 — Pickles

USER

> Pickles is a purple dragon. Please remember this character for the story.

ASSISTANT

> What is the story slug (for example, `dragon-tales`)? I’ll store Pickles as a purple dragon in that story’s canon.

USER

> session7-relationship-scope-test-01

ASSISTANT

> ✓ canon: Pickles — a purple dragon (current)

The submitted Pickles job completed as blob `U1UKSTmiCSV0vG0VvnUZ9DONNGpM7rLQNJgc20jZFC8`.

After terminal completion and a 65-second cooldown:

USER

> This scene is final.

ASSISTANT

> Pickles’s purple-dragon identity is already in canon; no duplicate stored.

## Step 2 — Space relationship

After a 65-second cooldown:

USER

> In an alternate reality called Space World, Pickles and a green alien named Zorp are best friends.

ASSISTANT

> ✓ canon: Pickles — a purple dragon (current)
>
> I’ll treat Space World, Zorp, and their best-friend relationship as unfinalized until you confirm the scene is final.

This response unexpectedly submitted a second identical Pickles job after recall returned empty. It completed as blob `wi4thsUq9ZhJJ9geZJRap-Ywu6LKUGtIYJ49hsryvw4`. After terminal completion and a 65-second cooldown:

USER

> This scene is final.

ASSISTANT

> ✓ canon: Zorp — a green alien in Space World  
> ✓ canon: Space World — an alternate reality  
> ✓ canon: Pickles and Zorp — best friends in Space World

The Space relationship candidate was:

> [canon:relationship] Pickles and Zorp — best friends in the alternate reality called Space World (as of: current)

Its exact-candidate recall in `session7-relationship-scope-test-01::relationships` returned no memories. Job `701af6d3-1b47-4de8-9f46-97ab3dcc771f` completed as blob `wzvNHP6MLSw9g9kggPwcELQ4DFExu_B7WfVdyZvZvl8`.

## Step 3 — Pirate relationship

After a 65-second cooldown:

USER

> In a separate alternate reality called Pirate World, Pickles has never met Zorp.

ASSISTANT

> Understood. In Pirate World, Pickles and Zorp have never met. This does not conflict with their friendship in Space World because the relationships belong to separate realities. I’ll wait to record it until the scene is final.

USER

> This scene is final.

ASSISTANT

> ✓ canon: Pirate World — a separate alternate reality from Space World (current scene)
>
> Pickles and Zorp’s “never met” status was recognized as reality-scoped and does not replace their friendship in Space World.

The first Pirate candidate was:

> [canon:relationship] Pickles and Zorp — have never met in Pirate World (as of: current scene)

Its recall in `session7-relationship-scope-test-01::relationships` returned the Space friendship blob at distance `0.13385820166153783`.

The prompt rephrased the candidate as:

> [canon:relationship] Pirate World Pickles–Zorp relationship — strangers; no meeting has ever occurred between them in this reality (as of: current scene)

That recall returned the same Space friendship blob at distance `0.17722621498214397`. No Pirate relationship write was submitted. Only a Pirate World place fact was submitted; it completed as blob `ol0EAbQA68ZxGIQASXkMPm5IPTc_TiPZhWnHJikhVxI`.
