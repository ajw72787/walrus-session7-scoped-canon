"use client";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Card } from "@/components/ui";
import {
  createConversationId,
  loadCharacters,
  saveCharacters,
  saveSelection,
  slugify,
  type Character,
} from "@/lib/client-state";
const inspirations = [
  "Space",
  "Pirates",
  "Dinosaurs",
  "Magic",
  "Underwater",
  "Superheroes",
];
export default function CreateWorldPage() {
  return (
    <Suspense fallback={<p>Opening the world maker…</p>}>
      <CreateWorld />
    </Suspense>
  );
}

function CreateWorld() {
  const router = useRouter();
  const requested = useSearchParams().get("character");
  const [character, setCharacter] = useState<Character | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [inspiration, setInspiration] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const chars = loadCharacters();
      setCharacter(
        chars.find((item) => item.id === requested) ?? chars[0] ?? null,
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, [requested]);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!character) return;
    const chars = loadCharacters();
    const id = slugify(name);
    if (character.worlds.some((world) => world.id === id)) return;
    const world = {
      id,
      name: name.trim(),
      description: description.trim(),
      inspiration,
    };
    saveCharacters(
      chars.map((item) =>
        item.id === character.id
          ? { ...item, worlds: [...item.worlds, world] }
          : item,
      ),
    );
    saveSelection({ characterId: character.id, worldId: id });
    sessionStorage.setItem("walrus-s7-conversation", createConversationId());
    router.push(`/story?character=${character.id}&world=${id}&new=1`);
  }
  if (!character)
    return (
      <Card>
        <h1 className="text-2xl font-black">Create a character first</h1>
        <p className="mt-2">Every world needs someone to explore it.</p>
      </Card>
    );
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="eyebrow">Create a world</p>
        <h1 className="mt-2 text-4xl font-black text-[var(--ink)]">
          Where should {character.name} go?
        </h1>
      </header>
      <Card>
        <form onSubmit={submit} className="space-y-6">
          <label className="block space-y-2">
            <span className="font-bold">World name</span>
            <input
              required
              className="field"
              placeholder="Moonlight Kingdom"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {name && (
              <small className="text-[var(--muted)]">
                World key: {slugify(name)}
              </small>
            )}
          </label>
          <fieldset>
            <legend className="mb-3 font-bold">Need an idea?</legend>
            <div className="flex flex-wrap gap-2">
              {inspirations.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={inspiration === item}
                  onClick={() => {
                    setInspiration(item);
                    if (!name) setName(`${item} World`);
                  }}
                  className={`min-h-11 rounded-full border-2 px-4 font-bold ${inspiration === item ? "border-[var(--purple)] bg-[#eee8ff] text-[var(--purple-dark)]" : "border-[var(--border)] bg-white"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block space-y-2">
            <span className="font-bold">
              What is this world like?{" "}
              <span className="font-normal text-[var(--muted)]">
                · optional
              </span>
            </span>
            <textarea
              rows={4}
              className="field"
              placeholder="Floating islands, friendly monsters, rivers of stars…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <Button type="submit" disabled={!name.trim()}>
            Enter This World
          </Button>
        </form>
      </Card>
      <p className="text-sm text-[var(--muted)]">
        Creating a world saves its name for navigation. Story events become
        remembered canon only when you choose “Save This Part.”
      </p>
    </div>
  );
}
