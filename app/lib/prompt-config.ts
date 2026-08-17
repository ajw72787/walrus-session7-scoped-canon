export const PROMPT_FILES = {
  original: "../prompts/continuity-keeper-original.md",
  scoped: "../prompts/continuity-keeper-scoped.md",
} as const;

export type PromptMode = keyof typeof PROMPT_FILES;

export const ENGINE_LABELS: Record<PromptMode, string> = {
  original: "Original Continuity Keeper",
  scoped: "Continuity Keeper — Scoped Canon",
};

export function resolvePromptMode(value: string | undefined): PromptMode {
  const mode = value ?? "original";
  if (mode !== "original" && mode !== "scoped")
    throw new Error(
      `Unsupported PROMPT_MODE: ${mode}. Valid values are "original" and "scoped".`,
    );
  return mode;
}
