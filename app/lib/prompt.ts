import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  ENGINE_LABELS,
  PROMPT_FILES,
  resolvePromptMode,
  type PromptMode,
} from "@/lib/prompt-config";

export type { PromptMode } from "@/lib/prompt-config";

export function getPromptMode(): PromptMode {
  return resolvePromptMode(process.env.PROMPT_MODE);
}

export function getPromptFile() {
  return PROMPT_FILES[getPromptMode()];
}

export function getEngineLabel() {
  return ENGINE_LABELS[getPromptMode()];
}

export async function loadPrompt() {
  const promptName = path.basename(getPromptFile());
  return readFile(
    path.join(process.cwd(), "..", "prompts", promptName),
    "utf8",
  );
}
