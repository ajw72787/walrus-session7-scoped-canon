import { NextResponse } from "next/server";
import { z } from "zod";
import { generateResponse } from "@/lib/openai";
import { getPromptMode, loadPrompt } from "@/lib/prompt";
import { storySlug } from "@/lib/client-state";

export const runtime = "nodejs";

const requestSchema = z.object({
  action: z.enum(["continue", "finalize"]),
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
  character: z.object({
    id: z.string().trim().min(1).max(200),
    name: z.string().trim().min(1).max(200),
    type: z.string().max(2_000),
    appearance: z.string().max(5_000),
    personality: z.string().max(5_000),
    ability: z.string().max(5_000),
    likes: z.string().max(5_000),
    fear: z.string().max(5_000),
    details: z.string().max(10_000),
    summary: z.string().max(5_000),
  }),
  world: z
    .object({
      id: z
        .string()
        .trim()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      name: z.string().trim().min(1).max(200),
      description: z.string().max(10_000),
      inspiration: z.string().max(2_000).optional(),
    })
    .nullable(),
});

export async function POST(request: Request) {
  try {
    const input = requestSchema.parse(await request.json());
    const promptMode = getPromptMode();
    if (input.namespace !== storySlug(input.character))
      throw new Error("Story namespace does not match the selected character.");
    if (
      promptMode === "scoped" &&
      input.world &&
      input.activeReality !== input.world.id
    )
      throw new Error("Active reality does not match the selected world.");
    const result = await generateResponse(
      await loadPrompt(),
      input.history,
      input.message,
      input.namespace,
      promptMode,
      promptMode === "scoped" ? input.activeReality : null,
      input.action,
      input.character,
      input.world,
    );
    return NextResponse.json({
      response: result.text,
      operations: result.operations,
      jobs: result.jobs,
      preloadedCanon: result.preloadedCanon,
      preloadErrors: result.preloadErrors,
      writeToolsEnabled: result.writeToolsEnabled,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Chat request failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
