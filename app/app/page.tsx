import { ActionLink, Badge, Card } from "@/components/ui";
import { getEngineLabel, getPromptMode } from "@/lib/prompt";

export const dynamic = "force-dynamic";

export default function Home() {
  const engineLabel = getEngineLabel();
  const scoped = getPromptMode() === "scoped";
  return (
    <div className="space-y-8">
      <div className="max-w-3xl space-y-5">
        <Badge>Engine: {engineLabel}</Badge>
        <div>
          <p className="mb-2 text-sm font-semibold tracking-[0.22em] text-violet-300 uppercase">
            Walrus Session 7
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Continuity Keeper Harness
          </h1>
        </div>
        <p className="text-lg leading-8 text-[var(--muted)]">
          This application is running the {scoped ? "Scoped Canon" : "original"}
          Continuity Keeper prompt selected by the server environment.
        </p>
      </div>
      <Card className="flex flex-wrap gap-3">
        <ActionLink href="/create">Create Character</ActionLink>
        <ActionLink href="/story" secondary>
          Story
        </ActionLink>
        <ActionLink href="/debug" secondary>
          Debug
        </ActionLink>
      </Card>
    </div>
  );
}
