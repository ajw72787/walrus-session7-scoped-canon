"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Badge, Card } from "@/components/ui";
import {
  CONVERSATION_STORAGE_KEY,
  DEBUG_STORAGE_KEY,
  NAMESPACE_STORAGE_KEY,
  createConversationId,
  type ChatMessage,
  type DebugSnapshot,
} from "@/lib/client-state";

const defaultNamespace = "walrus-session7-baseline";

export default function Story() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [namespace, setNamespace] = useState(defaultNamespace);
  const [conversationId, setConversationId] = useState("");
  const [clientStateLoaded, setClientStateLoaded] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setNamespace(
        sessionStorage.getItem(NAMESPACE_STORAGE_KEY) ?? defaultNamespace,
      );
      setConversationId(
        sessionStorage.getItem(CONVERSATION_STORAGE_KEY) ??
          createConversationId(),
      );
      setClientStateLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (clientStateLoaded && conversationId)
      sessionStorage.setItem(CONVERSATION_STORAGE_KEY, conversationId);
  }, [clientStateLoaded, conversationId]);
  useEffect(() => {
    if (clientStateLoaded)
      sessionStorage.setItem(NAMESPACE_STORAGE_KEY, namespace);
  }, [clientStateLoaded, namespace]);

  async function send(event: FormEvent) {
    event.preventDefault();
    const current = message.trim();
    if (!current || pending) return;
    setPending(true);
    setError(null);
    setMessage("");
    try {
      const result = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: current,
          history: messages,
          namespace,
        }),
      });
      const data = (await result.json()) as {
        error?: string;
        response?: string;
        operations?: DebugSnapshot["operations"];
        jobs?: DebugSnapshot["jobs"];
      };
      if (!result.ok || !data.response)
        throw new Error(data.error ?? "Chat failed.");
      setMessages([
        ...messages,
        { role: "user", content: current },
        { role: "assistant", content: data.response },
      ]);
      sessionStorage.setItem(
        DEBUG_STORAGE_KEY,
        JSON.stringify({
          namespace,
          conversationId,
          operations: data.operations ?? [],
          jobs: data.jobs ?? [],
        } satisfies DebugSnapshot),
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Chat failed.");
    } finally {
      setPending(false);
    }
  }

  function reset() {
    setMessages([]);
    setError(null);
    setConversationId(createConversationId());
    sessionStorage.removeItem(DEBUG_STORAGE_KEY);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <Badge>Original Continuity Keeper</Badge>
          <h1 className="text-3xl font-bold">Story</h1>
        </div>
        <button
          onClick={reset}
          className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--surface-high)]"
        >
          Reset local conversation
        </button>
      </div>
      <Card>
        <label className="flex flex-col gap-2 text-sm font-medium sm:flex-row sm:items-center">
          <span>Active namespace</span>
          <input
            value={namespace}
            onChange={(e) => setNamespace(e.target.value)}
            className="flex-1 rounded-lg border border-[var(--border)] bg-black/20 px-3 py-2 font-mono text-xs"
          />
        </label>
      </Card>
      <Card className="min-h-[24rem] space-y-4">
        {messages.length === 0 && (
          <div className="grid min-h-72 place-items-center text-center text-[var(--muted)]">
            <p>
              No messages yet.
              <br />
              Start a baseline conversation when you are ready.
            </p>
          </div>
        )}
        {messages.map((item, index) => (
          <div
            key={index}
            className={`max-w-3xl rounded-xl px-4 py-3 ${item.role === "user" ? "ml-auto bg-violet-600" : "bg-[var(--surface-high)]"}`}
          >
            <p className="mb-1 text-xs font-semibold uppercase opacity-60">
              {item.role}
            </p>
            <p className="leading-7 whitespace-pre-wrap">{item.content}</p>
          </div>
        ))}
      </Card>
      <form onSubmit={send} className="flex gap-3">
        <textarea
          aria-label="Message"
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write the next story message…"
          className="flex-1 resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
        />
        <button
          disabled={pending || !message.trim()}
          className="rounded-xl bg-violet-600 px-6 font-semibold hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Sending…" : "Send"}
        </button>
      </form>
      {error && (
        <p role="alert" className="text-sm text-amber-300">
          {error}
        </p>
      )}
    </div>
  );
}
