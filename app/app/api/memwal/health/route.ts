import { NextResponse } from "next/server";
import { health } from "@/lib/memwal";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json(await health());
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Health check failed.",
      },
      { status: 503 },
    );
  }
}
