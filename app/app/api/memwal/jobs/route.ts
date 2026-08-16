import { NextResponse } from "next/server";
import { z } from "zod";
import { inspectMemoryJobs } from "@/lib/memory-jobs";

export const runtime = "nodejs";

const schema = z.object({
  namespace: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  jobIds: z.array(z.string().min(1).max(200)).max(20),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    return NextResponse.json({
      jobs: await inspectMemoryJobs(input.namespace, input.jobIds),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Job lookup failed." },
      { status: 400 },
    );
  }
}
