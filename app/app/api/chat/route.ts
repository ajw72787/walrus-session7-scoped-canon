import { NextResponse } from "next/server";
import { z } from "zod";
import { generateResponse } from "@/lib/openai";
import { getPromptMode, loadPrompt } from "@/lib/prompt";

export const runtime = "nodejs";

const requestSchema = z.object({
  message: z.string().trim().min(1).max(20_000),
  namespace: z
    .string()
    .trim()
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Namespace must be a story slug."),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(50_000),
      }),
    )
    .max(200),
  activeReality: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Active reality must be a slug.")
    .nullable()
    .default(null),
});

export async function POST(request: Request) {
  try {
    const input = requestSchema.parse(await request.json());
    const promptMode = getPromptMode();
    const result = await generateResponse(
      await loadPrompt(),
      input.history,
      input.message,
      input.namespace,
      promptMode,
      promptMode === "scoped" ? input.activeReality : null,
    );
    return NextResponse.json({
      response: result.text,
      operations: result.operations,
      jobs: result.jobs,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Chat request failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
