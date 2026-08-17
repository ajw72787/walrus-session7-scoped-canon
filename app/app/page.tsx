"use client";
import { useEffect, useState } from "react";
import { ActionLink, Card } from "@/components/ui";
import {
  loadCharacters,
  saveSelection,
  type Character,
} from "@/lib/client-state";

export default function CharacterShelf() {
  const [characters, setCharacters] = useState<Character[] | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => setCharacters(loadCharacters()), 0);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <div className="space-y-9">
      <header className="max-w-3xl space-y-4">
        <p className="eyebrow">Your character shelf</p>
        <h1 className="text-4xl font-black tracking-tight text-[var(--ink)] sm:text-6xl">
          Who are we telling stories about?
        </h1>
        <p className="text-lg text-[var(--muted)]">
          Make a character, send them into wonderful worlds, and we’ll remember
          what happens.
        </p>
      </header>
      {characters === null ? (
        <p>Opening your shelf…</p>
      ) : characters.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((character, index) => (
            <Card key={character.id} className="flex min-h-64 flex-col">
              <div
                className={`mb-5 grid size-16 place-items-center rounded-2xl text-3xl ${["bg-[#ffe4a8]", "bg-[#dcd0ff]", "bg-[#ccefdc]"][index % 3]}`}
                aria-hidden="true"
              >
                {character.name.slice(0, 1).toUpperCase()}
              </div>
              <h2 className="text-2xl font-black text-[var(--ink)]">
                {character.name}
              </h2>
              <p className="mt-2 flex-1 text-[var(--muted)]">
                {character.summary ||
                  character.type ||
                  "A character ready for adventure."}
              </p>
              <p className="my-4 text-sm font-bold text-[var(--purple-dark)]">
                {character.worlds.length}{" "}
                {character.worlds.length === 1 ? "world" : "worlds"}
              </p>
              <ActionLink
                href={`/character/${character.id}`}
                className="w-full"
              >
                <span
                  onClick={() =>
                    saveSelection({ characterId: character.id, worldId: null })
                  }
                >
                  Continue with {character.name}
                </span>
              </ActionLink>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="max-w-2xl border-dashed text-center">
          <div
            className="mx-auto mb-4 grid size-20 place-items-center rounded-full bg-[#eee8ff] text-4xl"
            aria-hidden="true"
          >
            ✦
          </div>
          <h2 className="text-2xl font-black text-[var(--ink)]">
            Your shelf is waiting
          </h2>
          <p className="mx-auto mt-2 mb-6 max-w-md text-[var(--muted)]">
            Start with someone you already imagine—or make someone completely
            new.
          </p>
          <ActionLink href="/create">Create a Character</ActionLink>
        </Card>
      )}
      {characters?.length ? (
        <ActionLink href="/create">+ Create a Character</ActionLink>
      ) : null}
    </div>
  );
}
