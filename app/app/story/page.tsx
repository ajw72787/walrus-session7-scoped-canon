"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  Suspense,
  useState,
  type FormEvent,
} from "react";
import { useSearchParams } from "next/navigation";
import { ActionLink, Button, Card } from "@/components/ui";
import {
  CONVERSATION_STORAGE_KEY,
  DEBUG_STORAGE_KEY,
  STORY_HISTORY_STORAGE_KEY,
  createConversationId,
  loadCharacters,
  loadSelection,
  saveSelection,
  storySlug,
  type Character,
  type ChatMessage,
  type DebugSnapshot,
  type MemoryJob,
  type World,
} from "@/lib/client-state";

type ApiResult = {
  error?: string;
  response?: string;
  operations?: DebugSnapshot["operations"];
  jobs?: MemoryJob[];
};

export default function StoryPage() {
  return (
    <Suspense fallback={<p>Opening your story…</p>}>
      <Story />
    </Suspense>
  );
}

function Story() {
  const query = useSearchParams();
  const [character, setCharacter] = useState<Character | null>(null);
  const [world, setWorld] = useState<World | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [pending, setPending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [jobs, setJobs] = useState<MemoryJob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const namespace = character ? storySlug(character) : "";
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const chars = loadCharacters();
      const selected = loadSelection();
      const characterId = query.get("character") ?? selected.characterId;
      const found = chars.find((item) => item.id === characterId) ?? null;
      const worldId = query.get("world") ?? selected.worldId;
      const foundWorld =
        found?.worlds.find((item) => item.id === worldId) ?? null;
      setCharacter(found);
      setWorld(foundWorld);
      if (found && foundWorld)
        saveSelection({ characterId: found.id, worldId: foundWorld.id });
      const id =
        sessionStorage.getItem(CONVERSATION_STORAGE_KEY) ??
        createConversationId();
      setConversationId(id);
      sessionStorage.setItem(CONVERSATION_STORAGE_KEY, id);
      try {
        const stored = sessionStorage.getItem(
          `${STORY_HISTORY_STORAGE_KEY}:${id}`,
        );
        if (stored) setMessages(JSON.parse(stored) as ChatMessage[]);
        const debug = sessionStorage.getItem(DEBUG_STORAGE_KEY);
        if (debug) {
          const snapshot = JSON.parse(debug) as DebugSnapshot;
          if (
            found &&
            snapshot.namespace === storySlug(found) &&
            snapshot.activeReality === foundWorld?.id
          )
            setJobs(snapshot.jobs ?? []);
        }
      } catch {}
    }, 0);
    return () => window.clearTimeout(timer);
  }, [query]);
  useEffect(() => {
    if (conversationId)
      sessionStorage.setItem(
        `${STORY_HISTORY_STORAGE_KEY}:${conversationId}`,
        JSON.stringify(messages),
      );
  }, [conversationId, messages]);
  const persistDebug = useCallback(
    (operations: DebugSnapshot["operations"], newJobs: MemoryJob[]) => {
      if (!character || !world) return;
      let previous: DebugSnapshot | null = null;
      try {
        const raw = sessionStorage.getItem(DEBUG_STORAGE_KEY);
        if (raw) previous = JSON.parse(raw) as DebugSnapshot;
      } catch {}
      const matching =
        previous?.namespace === namespace &&
        previous.activeReality === world.id;
      const snapshot: DebugSnapshot = {
        namespace,
        characterName: character.name,
        activeReality: world.id,
        conversationId,
        operations: [
          ...(matching ? (previous?.operations ?? []) : []),
          ...operations,
        ],
        jobs: [...(matching ? (previous?.jobs ?? []) : []), ...newJobs],
      };
      sessionStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify(snapshot));
      setJobs(snapshot.jobs);
    },
    [character, conversationId, namespace, world],
  );
  async function request(text: string) {
    if (!character || !world) return;
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        history: messages,
        namespace,
        activeReality: world.id,
      }),
    });
    const data = (await response.json()) as ApiResult;
    if (!response.ok || !data.response)
      throw new Error(data.error ?? "The story couldn’t continue.");
    const next = [
      ...messages,
      { role: "user", content: text },
      { role: "assistant", content: data.response },
    ] satisfies ChatMessage[];
    setMessages(next);
    persistDebug(data.operations ?? [], data.jobs ?? []);
    return data;
  }
  async function send(event: FormEvent) {
    event.preventDefault();
    const current = message.trim();
    if (!current || pending) return;
    setPending(true);
    setError(null);
    setMessage("");
    try {
      await request(current);
    } catch (cause) {
      setMessage(current);
      setError(
        cause instanceof Error ? cause.message : "The story couldn’t continue.",
      );
    } finally {
      setPending(false);
    }
  }
  async function savePart() {
    if (!messages.length || saving) return;
    setSaving(true);
    setError(null);
    try {
      await request(
        "This story section is final. Save the lasting facts from this part to canon now.",
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "This part couldn’t be saved.",
      );
    } finally {
      setSaving(false);
    }
  }
  useEffect(() => {
    if (
      !namespace ||
      !jobs.some((job) => !["completed", "failed"].includes(job.state))
    )
      return;
    let cancelled = false;
    async function poll() {
      const response = await fetch("/api/memwal/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namespace,
          jobIds: jobs.map((job) => job.jobId),
        }),
      });
      const data = (await response.json()) as { jobs?: MemoryJob[] };
      if (!cancelled && response.ok && data.jobs) {
        setJobs(data.jobs);
        const raw = sessionStorage.getItem(DEBUG_STORAGE_KEY);
        if (raw) {
          const snapshot = JSON.parse(raw) as DebugSnapshot;
          snapshot.jobs = data.jobs;
          sessionStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify(snapshot));
        }
      }
    }
    void poll();
    const timer = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [jobs, namespace]);
  const saveState = useMemo(
    () =>
      jobs.length
        ? jobs.some((job) => job.state === "failed")
          ? "failed"
          : jobs.every((job) => job.state === "completed")
            ? "complete"
            : "saving"
        : null,
    [jobs],
  );
  function newConversation() {
    const id = createConversationId();
    setConversationId(id);
    setMessages([]);
    setJobs([]);
    sessionStorage.setItem(CONVERSATION_STORAGE_KEY, id);
    sessionStorage.removeItem(DEBUG_STORAGE_KEY);
  }
  if (!character || !world)
    return (
      <Card className="mx-auto max-w-xl text-center">
        <div className="text-4xl">✦</div>
        <h1 className="mt-3 text-2xl font-black">
          Choose a character and a world
        </h1>
        <p className="my-4 text-[var(--muted)]">
          Stories need someone and somewhere to begin.
        </p>
        <ActionLink href="/">Go to Character Shelf</ActionLink>
      </Card>
    );
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">{character.name}</p>
          <h1 className="text-4xl font-black text-[var(--ink)]">
            {world.name}
          </h1>
          <p className="font-bold text-[var(--purple-dark)]">Current World</p>
        </div>
        <div className="flex gap-2">
          <ActionLink href={`/character/${character.id}`} secondary>
            Worlds
          </ActionLink>
          <Button secondary onClick={newConversation}>
            New Part
          </Button>
        </div>
      </header>
      {query.get("new") && !messages.length && (
        <div className="rounded-2xl bg-[#fff0c7] p-4">
          <strong>Welcome to {world.name}!</strong> Tell us what{" "}
          {character.name} sees or what happens first.
        </div>
      )}
      {saveState === "saving" && (
        <div role="status" className="rounded-2xl bg-[#fff0c7] p-4 font-bold">
          Saving… We’re making sure this part is remembered.
        </div>
      )}
      {saveState === "complete" && (
        <div
          role="status"
          className="rounded-2xl bg-[#e8f7ef] p-4 font-bold text-[var(--green)]"
        >
          ✓ We’ll remember this.
        </div>
      )}
      {saveState === "failed" && (
        <div
          role="alert"
          className="rounded-2xl bg-red-50 p-4 font-bold text-red-800"
        >
          We couldn’t save everything this time. Your story is still here; an
          adult can check Developer Details.
        </div>
      )}
      <Card className="min-h-[28rem] space-y-4">
        {!messages.length ? (
          <div className="grid min-h-80 place-items-center text-center">
            <div>
              <div className="text-5xl" aria-hidden="true">
                💭
              </div>
              <h2 className="mt-4 text-2xl font-black">What happens next?</h2>
              <p className="mt-2 text-[var(--muted)]">
                You can write one sentence or a whole scene.
              </p>
            </div>
          </div>
        ) : (
          messages.map((item, index) => (
            <article
              key={index}
              className={`max-w-[88%] rounded-2xl px-5 py-4 ${item.role === "user" ? "ml-auto bg-[var(--purple)] text-white" : "bg-[var(--surface-high)]"}`}
            >
              <p className="mb-1 text-xs font-black uppercase opacity-70">
                {item.role === "user" ? "You" : "Storyteller"}
              </p>
              <p className="leading-7 whitespace-pre-wrap">{item.content}</p>
            </article>
          ))
        )}
      </Card>
      <form onSubmit={send} className="space-y-3">
        <label htmlFor="next" className="text-lg font-black">
          What happens next?
        </label>
        <textarea
          id="next"
          rows={3}
          className="field"
          placeholder={`${character.name} finds a mysterious door…`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="flex flex-wrap justify-between gap-3">
          <Button disabled={pending || saving || !message.trim()}>
            {pending ? "Thinking…" : "Continue Story"}
          </Button>
          <Button
            type="button"
            secondary
            onClick={savePart}
            disabled={pending || saving || !messages.length}
          >
            {saving ? "Saving…" : "Save This Part"}
          </Button>
        </div>
      </form>
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">
          {error}
        </p>
      )}
      <div className="text-right">
        <ActionLink
          href={`/memories?character=${character.id}&world=${world.id}`}
          secondary
        >
          What We Remember
        </ActionLink>
      </div>
    </div>
  );
}
