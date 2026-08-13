"use client";

import { useState, type FormEvent } from "react";
import { Badge, Card } from "@/components/ui";
import { CHARACTER_STORAGE_KEY, type Character } from "@/lib/client-state";

const empty: Character = {
  name: "",
  type: "",
  appearance: "",
  ability: "",
  likes: "",
  fear: "",
  details: "",
};
const pickles: Character = {
  name: "Pickles",
  type: "Dragon",
  appearance: "Purple",
  ability: "Breathes ice instead of fire",
  likes: "Pizza",
  fear: "Chickens",
  details: "",
};
const fields: Array<[keyof Character, string, boolean?]> = [
  ["name", "Name"],
  ["type", "What are they?"],
  ["appearance", "Appearance"],
  ["ability", "Special ability"],
  ["likes", "Likes"],
  ["fear", "Fear"],
  ["details", "Additional details", true],
];

export default function CreateCharacter() {
  const [character, setCharacter] = useState<Character>(empty);
  const [saved, setSaved] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    sessionStorage.setItem(CHARACTER_STORAGE_KEY, JSON.stringify(character));
    setSaved(true);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-3">
        <Badge>Local session only</Badge>
        <h1 className="text-3xl font-bold">Create a character</h1>
        <p className="text-[var(--muted)]">
          This form does not write to MemWal.
        </p>
      </div>
      <Card>
        <form onSubmit={submit} className="space-y-5">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setCharacter(pickles);
                setSaved(false);
              }}
              className="text-sm font-semibold text-violet-300 hover:text-violet-200"
            >
              Fill Pickles example
            </button>
          </div>
          {fields.map(([key, label, multiline]) => (
            <label key={key} className="block space-y-2">
              <span className="text-sm font-medium">{label}</span>
              {multiline ? (
                <textarea
                  rows={4}
                  value={character[key]}
                  onChange={(e) => {
                    setCharacter({ ...character, [key]: e.target.value });
                    setSaved(false);
                  }}
                  className="w-full rounded-lg border border-[var(--border)] bg-black/20 px-3 py-2"
                />
              ) : (
                <input
                  required
                  value={character[key]}
                  onChange={(e) => {
                    setCharacter({ ...character, [key]: e.target.value });
                    setSaved(false);
                  }}
                  className="w-full rounded-lg border border-[var(--border)] bg-black/20 px-3 py-2"
                />
              )}
            </label>
          ))}
          <div className="flex items-center gap-4">
            <button className="rounded-lg bg-violet-600 px-4 py-2.5 font-semibold hover:bg-violet-500">
              Save to this session
            </button>
            {saved && (
              <span className="text-sm text-emerald-300">Saved locally.</span>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
