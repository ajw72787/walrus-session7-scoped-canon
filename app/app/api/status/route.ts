import { NextResponse } from "next/server";
import { getMemWalStatus } from "@/lib/memwal";
import { getOpenAIStatus } from "@/lib/openai";
import { getPromptFile, getPromptMode } from "@/lib/prompt";

export function GET() {
  return NextResponse.json({
    promptMode: getPromptMode(),
    promptFile: getPromptFile(),
    memwal: getMemWalStatus(),
    openai: getOpenAIStatus(),
  });
}
