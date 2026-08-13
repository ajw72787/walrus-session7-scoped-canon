import { NextResponse } from "next/server";
import { z } from "zod";
import { recall } from "@/lib/memwal";
import { generateResponse } from "@/lib/openai";
import { loadPrompt } from "@/lib/prompt";

export const runtime = "nodejs";

const requestSchema = z.object({
  message: z.string().trim().min(1).max(20_000),
  namespace: z.string().trim().min(1).max(200),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(50_000),
      }),
    )
    .max(200),
});

export async function POST(request: Request) {
  try {
    const input = requestSchema.parse(await request.json());
    let memories: Awaited<ReturnType<typeof recall>> = [];
    let recallWarning: string | null = null;
    try {
      memories = await recall(input.namespace, input.message);
    } catch (error) {
      recallWarning =
        error instanceof Error ? error.message : "MemWal recall failed.";
    }
    const memoryContext = memories
      .map(
        (memory) =>
          `[blob ${memory.blob_id}; distance ${memory.distance}] ${memory.text}`,
      )
      .join("\n");
    const response = await generateResponse(
      await loadPrompt(),
      input.history,
      input.message,
      memoryContext,
    );
    return NextResponse.json({
      response,
      memories: memories.map((memory) => ({
        blobId: memory.blob_id,
        text: memory.text,
        distance: memory.distance,
      })),
      recallWarning,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Chat request failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
