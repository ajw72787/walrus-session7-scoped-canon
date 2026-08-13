import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const PROMPT_FILES = {
  original: "../prompts/continuity-keeper-original.md",
} as const;

export type PromptMode = keyof typeof PROMPT_FILES;

export function getPromptMode(): PromptMode {
  const mode = process.env.PROMPT_MODE ?? "original";
  if (mode !== "original")
    throw new Error(
      `Unsupported PROMPT_MODE: ${mode}. Only \"original\" is enabled for the baseline.`,
    );
  return mode;
}

export function getPromptFile() {
  return PROMPT_FILES[getPromptMode()];
}

export async function loadPrompt() {
  const promptName = path.basename(getPromptFile());
  return readFile(
    path.join(process.cwd(), "..", "prompts", promptName),
    "utf8",
  );
}
