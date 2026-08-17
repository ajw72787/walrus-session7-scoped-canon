import { NextResponse } from "next/server";
import { getMemWalStatus } from "@/lib/memwal";
import { getOpenAIStatus } from "@/lib/openai";
import { getEngineLabel, getPromptFile, getPromptMode } from "@/lib/prompt";

export function GET() {
  const promptMode = getPromptMode();
  return NextResponse.json({
    promptMode,
    promptFile: getPromptFile(),
    engineLabel: getEngineLabel(),
    scopedCanonEnabled: promptMode === "scoped",
    memwal: getMemWalStatus(),
    openai: getOpenAIStatus(),
  });
}
