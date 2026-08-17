"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ActionLink, Button, Card } from "@/components/ui";
import {
  loadCharacters,
  loadSelection,
  slugify,
  storySlug,
  type Character,
  type World,
} from "@/lib/client-state";
import { getStoryRecallNamespaces } from "@/lib/namespaces";

type Memory = { blobId: string; text: string; distance: number };
type Group = { core: Memory[]; world: Memory[] };
function readable(text: string) {
  return text
    .replace(/^\[canon:[^\]]+\]\s*/i, "")
    .replace(/\s*\(as of:[^)]+\)\s*$/i, "")
    .replace(/^.+?\s+—\s+/, "");
}
function unique(items: Memory[]) {
  return items.filter(
    (item, index) =>
      items.findIndex((other) => other.blobId === item.blobId) === index,
  );
}

export default function MemoriesPage() {
  return (
    <Suspense fallback={<p>Opening the memory book…</p>}>
      <Memories />
    </Suspense>
  );
}

function Memories() {
  const query = useSearchParams();
  const [character, setCharacter] = useState<Character | null>(null);
  const [world, setWorld] = useState<World | null>(null);
  const [groups, setGroups] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const chars = loadCharacters();
      const selected = loadSelection();
      const found =
        chars.find(
          (item) =>
            item.id === (query.get("character") ?? selected.characterId),
        ) ?? null;
      setCharacter(found);
      setWorld(
        found?.worlds.find(
          (item) => item.id === (query.get("world") ?? selected.worldId),
        ) ?? null,
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, [query]);
  async function remember() {
    if (!character) return;
    setLoading(true);
    setError(null);
    const story = storySlug(character);
    const characterSlug = slugify(character.name);
    const { core, reality } = getStoryRecallNamespaces(
      story,
      characterSlug,
      world?.id ?? null,
      world?.id ?? null,
    );
    try {
      const recall = async (namespace: string) => {
        const response = await fetch("/api/memwal/recall", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            story,
            namespace,
            query: world
              ? `${character.name} in ${world.name} lasting canon`
              : `${character.name} shared identity and lasting canon`,
          }),
        });
        const data = (await response.json()) as {
          memories?: Memory[];
          error?: string;
        };
        if (!response.ok) throw new Error(data.error ?? "Recall failed.");
        return data.memories ?? [];
      };
      const [coreResults, worldResults] = await Promise.all([
        Promise.all(core.map(recall)),
        Promise.all(reality.map(recall)),
      ]);
      setGroups({
        core: unique(coreResults.flat()),
        world: unique(worldResults.flat()),
      });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "We couldn’t open these memories.",
      );
    } finally {
      setLoading(false);
    }
  }
  if (!character)
    return (
      <Card>
        <h1 className="text-2xl font-black">Choose a character first</h1>
        <ActionLink href="/" className="mt-4">
          Character Shelf
        </ActionLink>
      </Card>
    );
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="eyebrow">What We Remember</p>
        <h1 className="mt-2 text-4xl font-black text-[var(--ink)]">
          About {character.name}
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Shared details stay with {character.name} wherever they go. Each world
          keeps its own adventures.
        </p>
      </header>
      {!groups && (
        <Card className="text-center">
          <div className="text-4xl">📖</div>
          <h2 className="mt-3 text-xl font-black">Ready to remember?</h2>
          <p className="my-3 text-[var(--muted)]">
            Open the storybook to recall saved facts. This does not save
            anything new.
          </p>
          <Button onClick={remember} disabled={loading}>
            {loading ? "Remembering…" : "Show What We Remember"}
          </Button>
        </Card>
      )}
      {groups && (
        <>
          <MemoryCard
            title="About This Character"
            subtitle={`True for ${character.name} in every world`}
            items={groups.core}
          />
          {world && (
            <MemoryCard
              title={world.name}
              subtitle="Current World"
              items={groups.world}
            />
          )}
          <Button secondary onClick={remember} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh Memories"}
          </Button>
        </>
      )}
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">
          We couldn’t open the memory book. Please try again.
          <span className="sr-only"> {error}</span>
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <ActionLink
          href={
            world
              ? `/story?character=${character.id}&world=${world.id}`
              : `/character/${character.id}`
          }
        >
          Back to {world ? "the Story" : character.name}
        </ActionLink>
        <ActionLink href="/debug" secondary>
          Developer Details
        </ActionLink>
      </div>
    </div>
  );
}
function MemoryCard({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: Memory[];
}) {
  return (
    <Card>
      <p className="eyebrow">{subtitle}</p>
      <h2 className="mt-1 text-2xl font-black">{title}</h2>
      {items.length ? (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li
              key={item.blobId}
              className="flex gap-3 rounded-xl bg-[var(--surface-high)] p-4"
            >
              <span aria-hidden="true" className="text-[var(--purple)]">
                ✦
              </span>
              <span>{readable(item.text)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-[var(--muted)]">
          Nothing has been saved here yet. Tell a story, then choose “Save This
          Part.”
        </p>
      )}
    </Card>
  );
}
