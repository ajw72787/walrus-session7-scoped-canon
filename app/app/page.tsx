import { ActionLink, Badge, Card } from "@/components/ui";

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="max-w-3xl space-y-5">
        <Badge>Engine: Original Continuity Keeper</Badge>
        <div>
          <p className="mb-2 text-sm font-semibold tracking-[0.22em] text-violet-300 uppercase">
            Walrus Session 7
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Continuity Keeper — Baseline Harness
          </h1>
        </div>
        <p className="text-lg leading-8 text-[var(--muted)]">
          This application is currently running the original, unmodified
          Continuity Keeper prompt so its behavior can be measured before Scoped
          Canon is implemented.
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
