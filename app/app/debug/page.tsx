"use client";

import { useEffect, useState } from "react";
import { Badge, Card } from "@/components/ui";
import {
  CONVERSATION_STORAGE_KEY,
  DEBUG_STORAGE_KEY,
  NAMESPACE_STORAGE_KEY,
  type DebugSnapshot,
} from "@/lib/client-state";

type Status = {
  promptMode: string;
  promptFile: string;
  memwal: {
    configured: boolean;
    serverUrlConfigured: boolean;
    missing: string[];
  };
  openai: { configured: boolean; model: string };
};

export default function Debug() {
  const [status, setStatus] = useState<Status | null>(null);
  const [snapshot, setSnapshot] = useState<DebugSnapshot | null>(null);
  const [health, setHealth] = useState("No operation yet.");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    fetch("/api/status")
      .then((response) => response.json())
      .then(setStatus)
      .catch(() => setStatus(null));
    const timer = window.setTimeout(() => {
      const stored = sessionStorage.getItem(DEBUG_STORAGE_KEY);
      if (stored) setSnapshot(JSON.parse(stored) as DebugSnapshot);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function checkHealth() {
    setChecking(true);
    try {
      const response = await fetch("/api/memwal/health");
      const data = await response.json();
      setHealth(
        response.ok
          ? JSON.stringify(data, null, 2)
          : `Unavailable: ${data.error ?? response.status}`,
      );
    } catch {
      setHealth("Health check failed.");
    } finally {
      setChecking(false);
    }
  }

  const namespace =
    snapshot?.namespace ??
    (typeof window !== "undefined"
      ? sessionStorage.getItem(NAMESPACE_STORAGE_KEY)
      : null) ??
    "No operation yet.";
  const conversationId =
    snapshot?.conversationId ??
    (typeof window !== "undefined"
      ? sessionStorage.getItem(CONVERSATION_STORAGE_KEY)
      : null) ??
    "No operation yet.";
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Badge>Developer view</Badge>
        <h1 className="text-3xl font-bold">Debug</h1>
        <p className="text-[var(--muted)]">
          Configuration values are status-only; secrets are never returned.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold">Runtime</h2>
          <dl className="space-y-3 text-sm">
            <Row label="Prompt mode" value={status?.promptMode ?? "Loading…"} />
            <Row
              label="Exact prompt file"
              value={status?.promptFile ?? "Loading…"}
            />
            <Row label="Namespace" value={namespace} />
            <Row label="Conversation ID" value={conversationId} />
          </dl>
        </Card>
        <Card>
          <h2 className="mb-4 font-semibold">Services</h2>
          <dl className="space-y-3 text-sm">
            <Row
              label="OpenAI"
              value={
                status
                  ? status.openai.configured
                    ? `Configured (${status.openai.model})`
                    : "Not configured"
                  : "Loading…"
              }
            />
            <Row
              label="MemWal"
              value={
                status
                  ? status.memwal.configured
                    ? "Configured"
                    : `Not configured (${status.memwal.missing.join(", ")})`
                  : "Loading…"
              }
            />
            <Row
              label="MemWal server URL"
              value={
                status
                  ? status.memwal.serverUrlConfigured
                    ? "Configured by environment"
                    : "Using SDK default"
                  : "Loading…"
              }
            />
            <Row
              label="Most recent write blob ID"
              value={snapshot?.mostRecentWriteBlobId ?? "No operation yet."}
            />
          </dl>
        </Card>
      </div>
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-semibold">MemWal health</h2>
          <button
            onClick={checkHealth}
            disabled={checking}
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--surface-high)] disabled:opacity-50"
          >
            {checking ? "Checking…" : "Health Check"}
          </button>
        </div>
        <pre className="overflow-auto text-xs whitespace-pre-wrap text-[var(--muted)]">
          {health}
        </pre>
      </Card>
      <Card>
        <h2 className="mb-4 font-semibold">Most recent recalled memories</h2>
        {!snapshot?.recalledMemories.length ? (
          <p className="text-sm text-[var(--muted)]">No operation yet.</p>
        ) : (
          <div className="space-y-3">
            {snapshot.recalledMemories.map((memory) => (
              <div
                key={memory.blobId}
                className="rounded-lg bg-black/20 p-4 text-sm"
              >
                <div className="mb-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-violet-200">
                  <span>Blob: {memory.blobId}</span>
                  <span>Distance: {memory.distance}</span>
                </div>
                <p>{memory.text}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[10rem_1fr]">
      <dt className="text-[var(--muted)]">{label}</dt>
      <dd className="font-mono text-xs break-all">{value}</dd>
    </div>
  );
}
