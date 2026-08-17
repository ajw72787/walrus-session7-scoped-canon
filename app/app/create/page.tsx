"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ActionLink, Button, Card } from "@/components/ui";
import {
  CONVERSATION_STORAGE_KEY,
  DEBUG_STORAGE_KEY,
  createConversationId,
  loadCharacters,
  saveCharacters,
  saveSelection,
  slugify,
  storySlug,
  type Character,
  type DebugSnapshot,
} from "@/lib/client-state";

type Draft = Omit<Character, "id" | "summary" | "worlds" | "createdAt">;
const empty: Draft = {
  name: "",
  type: "",
  appearance: "",
  personality: "",
  ability: "",
  likes: "",
  fear: "",
  details: "",
};
const fields: Array<[keyof Draft, string, string]> = [
  ["name", "Name", "Milo"],
  ["type", "What are they?", "A tiny cloud, a brave fox…"],
  [
    "appearance",
    "What do they look like?",
    "Silver fur and a bright red scarf",
  ],
  ["personality", "What are they like?", "Curious, kind, and a little silly"],
  ["likes", "What do they love?", "Moonlight and blueberry pancakes"],
  ["fear", "What are they afraid of?", "Very loud thunder"],
  ["ability", "Special abilities", "Can talk to trees"],
  ["details", "Anything else?", "A favorite saying, a treasured object…"],
];

export default function CreateCharacter() {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(empty);
  const [reviewing, setReviewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const answers = fields.filter(([key]) => draft[key].trim());

  function review(event: FormEvent) {
    event.preventDefault();
    setReviewing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function create() {
    setSaving(true);
    setError(null);
    const existing = loadCharacters();
    const base = slugify(draft.name);
    const id = existing.some((item) => item.id === base)
      ? `${base}-${existing.filter((item) => item.id.startsWith(base)).length + 1}`
      : base;
    const summary = [draft.type, draft.personality].filter(Boolean).join(" · ");
    const character: Character = {
      ...draft,
      id,
      summary,
      worlds: [],
      createdAt: new Date().toISOString(),
    };
    const namespace = storySlug(character);
    const conversationId = createConversationId();
    const facts = answers
      .map(([key, label]) => `${label}: ${draft[key]}`)
      .join("\n");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "finalize",
          message: `We are creating ${draft.name}. The following character identity is true in every reality. This character setup is final. Extract and save the durable CORE character facts now.\n\n${facts}`,
          history: [],
          namespace,
          activeReality: null,
          character: {
            id,
            name: draft.name,
            type: draft.type,
            appearance: draft.appearance,
            personality: draft.personality,
            ability: draft.ability,
            likes: draft.likes,
            fear: draft.fear,
            details: draft.details,
            summary,
          },
          world: null,
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        operations?: DebugSnapshot["operations"];
        jobs?: DebugSnapshot["jobs"];
      };
      if (!response.ok)
        throw new Error(data.error ?? "We couldn’t create this character.");
      saveCharacters([...existing, character]);
      saveSelection({ characterId: id, worldId: null });
      sessionStorage.setItem(CONVERSATION_STORAGE_KEY, conversationId);
      sessionStorage.setItem(
        DEBUG_STORAGE_KEY,
        JSON.stringify({
          namespace,
          characterName: draft.name,
          activeReality: null,
          conversationId,
          operations: data.operations ?? [],
          jobs: data.jobs ?? [],
        } satisfies DebugSnapshot),
      );
      router.push(`/character/${id}?created=1`);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "We couldn’t create this character.",
      );
      setSaving(false);
    }
  }

  if (reviewing)
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <p className="eyebrow">Almost ready</p>
          <h1 className="mt-2 text-4xl font-black text-[var(--ink)]">
            Here’s who we made…
          </h1>
        </header>
        <Card className="space-y-4">
          <h2 className="text-3xl font-black text-[var(--purple-dark)]">
            {draft.name}
          </h2>
          <dl className="space-y-3">
            {answers
              .filter(([key]) => key !== "name")
              .map(([key, label]) => (
                <div key={key}>
                  <dt className="text-sm font-black text-[var(--muted)]">
                    {label}
                  </dt>
                  <dd className="text-lg">{draft[key]}</dd>
                </div>
              ))}
          </dl>
        </Card>
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <Button onClick={create} disabled={saving}>
            {saving ? "Creating and saving…" : "Create Character"}
          </Button>
          <Button
            secondary
            onClick={() => setReviewing(false)}
            disabled={saving}
          >
            Make a Change
          </Button>
        </div>
        <p className="text-sm text-[var(--muted)]">
          Creating saves these shared character facts to What We Remember.
        </p>
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-3">
        <p className="eyebrow">Create a character</p>
        <h1 className="text-4xl font-black text-[var(--ink)]">
          Who should we meet?
        </h1>
        <p className="text-[var(--muted)]">
          Just a name is required. Add as much or as little as you like.
        </p>
      </header>
      <Card>
        <form onSubmit={review} className="space-y-5">
          {fields.map(([key, label, placeholder]) => (
            <label key={key} className="block space-y-2">
              <span className="font-bold">
                {label}
                {key !== "name" && (
                  <span className="font-normal text-[var(--muted)]">
                    {" "}
                    · optional
                  </span>
                )}
              </span>
              {key === "details" ? (
                <textarea
                  rows={3}
                  className="field"
                  placeholder={placeholder}
                  value={draft[key]}
                  onChange={(e) =>
                    setDraft({ ...draft, [key]: e.target.value })
                  }
                />
              ) : (
                <input
                  required={key === "name"}
                  className="field"
                  placeholder={placeholder}
                  value={draft[key]}
                  onChange={(e) =>
                    setDraft({ ...draft, [key]: e.target.value })
                  }
                />
              )}
            </label>
          ))}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" disabled={!draft.name.trim()}>
              See My Character
            </Button>
            <ActionLink href="/" secondary>
              Cancel
            </ActionLink>
          </div>
        </form>
      </Card>
    </div>
  );
}
