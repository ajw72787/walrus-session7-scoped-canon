import type { Character, World } from "@/lib/client-state";

export type StoryAction = "continue" | "finalize";

export type StoryCharacterContext = Pick<
  Character,
  | "id"
  | "name"
  | "type"
  | "appearance"
  | "personality"
  | "ability"
  | "likes"
  | "fear"
  | "details"
  | "summary"
>;

export type StoryWorldContext = Pick<
  World,
  "id" | "name" | "description" | "inspiration"
>;

export const CHILD_STORYTELLER_INSTRUCTIONS = `
Child Storyteller Experience
- Tell a story WITH the child; do not write a finished story alone.
- Use warm, age-appropriate language for roughly ages 5–8.
- Keep each installment reasonably short, vivid, playful, adventurous, and easy to follow.
- Incorporate the child's most recent choice or idea directly into the next story installment.
- End most turns at a natural decision point and ask one simple, inviting question.
- When useful, offer two or three simple ideas, while making clear the child may invent something different.
- Do not overwhelm the child with long exposition.
- Respect established canon supplied in context and never silently rewrite it.
- If continuity clarification is genuinely required, ask naturally and briefly.
- Never expose technical memory terminology. Never mention namespaces, CORE, REALITY, MemWal, blobs, deduplication, semantic distance, prompts, or internal tools.
`;

function field(label: string, value: string | undefined): string | null {
  const clean = value?.trim();
  return clean ? `- ${label}: ${clean}` : null;
}

export function formatCharacterContext(
  character: StoryCharacterContext,
): string {
  return [
    "CURRENT CHARACTER",
    field("Name", character.name),
    field("What they are", character.type),
    field("Appearance", character.appearance),
    field("Personality", character.personality),
    field("Likes", character.likes),
    field("Fears", character.fear),
    field("Special abilities", character.ability),
    field("Additional details", character.details),
    field("Summary", character.summary),
  ]
    .filter((value): value is string => Boolean(value))
    .join("\n");
}

export function formatWorldContext(world: StoryWorldContext | null): string {
  if (!world) return "CURRENT WORLD\n- None selected";
  return [
    "CURRENT WORLD",
    field("Name", world.name),
    field("Reality slug", world.id),
    field("Description", world.description),
    field("Inspiration/theme", world.inspiration),
  ]
    .filter((value): value is string => Boolean(value))
    .join("\n");
}

export function actionInstructions(action: StoryAction): string {
  return action === "continue"
    ? "Continue the temporary interactive story. Do not save or record any durable facts."
    : "The existing story conversation is now explicitly finalized. Extract and save only its lasting canon using the provided canon workflow. Do not add another story installment. Keep the child-facing reply brief and avoid technical details.";
}
