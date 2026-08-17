"use client";
import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ActionLink, Card } from "@/components/ui";
import {
  loadCharacters,
  saveSelection,
  type Character,
} from "@/lib/client-state";

export default function CharacterPage() {
  return (
    <Suspense fallback={<p>Opening this character…</p>}>
      <CharacterHome />
    </Suspense>
  );
}

function CharacterHome() {
  const { characterSlug } = useParams<{ characterSlug: string }>();
  const created = useSearchParams().get("created");
  const [character, setCharacter] = useState<Character | null | undefined>(
    undefined,
  );
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const found =
        loadCharacters().find((item) => item.id === characterSlug) ?? null;
      setCharacter(found);
      if (found) saveSelection({ characterId: found.id, worldId: null });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [characterSlug]);
  if (character === undefined) return <p>Opening this character…</p>;
  if (!character)
    return (
      <Card>
        <h1 className="text-2xl font-black">Character not found</h1>
        <p className="my-4 text-[var(--muted)]">
          This character may only exist in another browser.
        </p>
        <ActionLink href="/">Back to the shelf</ActionLink>
      </Card>
    );
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow">Character home</p>
          <h1 className="mt-2 text-5xl font-black text-[var(--ink)]">
            {character.name}
          </h1>
          <p className="mt-2 text-lg text-[var(--muted)]">
            {character.summary || "Ready for a new story."}
          </p>
        </div>
        <ActionLink href={`/world/create?character=${character.id}`}>
          + Create a World
        </ActionLink>
      </header>
      {created && (
        <div
          role="status"
          className="rounded-2xl bg-[#e8f7ef] p-4 font-bold text-[var(--green)]"
        >
          Character created. Their shared details are being checked in What We
          Remember.
        </div>
      )}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">About this character</p>
            <p className="mt-2 text-lg">
              {[
                character.appearance,
                character.personality,
                character.likes && `Loves ${character.likes}`,
              ]
                .filter(Boolean)
                .join(" · ") || "Their shared details will appear here."}
            </p>
          </div>
          <ActionLink href={`/memories?character=${character.id}`} secondary>
            See What We Remember
          </ActionLink>
        </div>
      </Card>
      <section aria-labelledby="worlds-heading" className="space-y-4">
        <h2
          id="worlds-heading"
          className="text-3xl font-black text-[var(--ink)]"
        >
          Their Worlds
        </h2>
        {character.worlds.length ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {character.worlds.map((world, index) => (
              <Card key={world.id} className="flex flex-col">
                <div
                  className={`mb-4 h-3 rounded-full ${index % 2 ? "bg-[#6fc6aa]" : "bg-[#f6b955]"}`}
                />
                <h3 className="text-2xl font-black">{world.name}</h3>
                <p className="mt-2 flex-1 text-[var(--muted)]">
                  {world.description || "A world waiting for its next chapter."}
                </p>
                <div className="mt-5 flex gap-3">
                  <ActionLink
                    href={`/story?character=${character.id}&world=${world.id}`}
                  >
                    <span
                      onClick={() =>
                        saveSelection({
                          characterId: character.id,
                          worldId: world.id,
                        })
                      }
                    >
                      Tell a Story
                    </span>
                  </ActionLink>
                  <ActionLink
                    href={`/memories?character=${character.id}&world=${world.id}`}
                    secondary
                  >
                    Remember
                  </ActionLink>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed text-center">
            <div className="text-4xl" aria-hidden="true">
              🪐
            </div>
            <h3 className="mt-3 text-xl font-black">
              Where will {character.name} go?
            </h3>
            <p className="my-3 text-[var(--muted)]">
              A world can be anywhere you can imagine.
            </p>
            <ActionLink href={`/world/create?character=${character.id}`}>
              Create Their First World
            </ActionLink>
          </Card>
        )}
      </section>
    </div>
  );
}
