import { NextResponse } from "next/server";
import { z } from "zod";
import { recall } from "@/lib/memwal";
import { isCanonNamespace } from "@/lib/namespaces";

export const runtime = "nodejs";
const schema = z.object({
  story: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  namespace: z.string().trim().min(1).max(200),
  query: z.string().trim().min(1).max(20_000),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    if (!isCanonNamespace(input.story, input.namespace))
      throw new Error(
        `Namespace must be a valid Continuity Keeper child of ${input.story}.`,
      );
    const memories = await recall(input.namespace, input.query);
    return NextResponse.json({
      memories: memories.map((item) => ({
        blobId: item.blob_id,
        text: item.text,
        distance: item.distance,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Recall failed." },
      { status: 400 },
    );
  }
}
