"use client";

import { useEffect, useState } from "react";
import { Badge, Card } from "@/components/ui";
import {
  ACTIVE_REALITY_STORAGE_KEY,
  CONVERSATION_STORAGE_KEY,
  DEBUG_STORAGE_KEY,
  NAMESPACE_STORAGE_KEY,
  type DebugSnapshot,
  type MemoryJob,
} from "@/lib/client-state";

type Status = {
  promptMode: string;
  promptFile: string;
  engineLabel: string;
  scopedCanonEnabled: boolean;
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
  const [jobs, setJobs] = useState<MemoryJob[]>([]);
  const [health, setHealth] = useState("No operation yet.");
  const [checking, setChecking] = useState(false);
  const [storedNamespace, setStoredNamespace] = useState("No operation yet.");
  const [storedConversationId, setStoredConversationId] =
    useState("No operation yet.");
  const [storedReality, setStoredReality] = useState("None");
  const pollNamespace = snapshot?.namespace;
  const jobIds = JSON.stringify(jobs.map((job) => job.jobId));

  useEffect(() => {
    fetch("/api/status")
      .then((response) => response.json())
      .then(setStatus)
      .catch(() => setStatus(null));
    const timer = window.setTimeout(() => {
      setStoredNamespace(
        sessionStorage.getItem(NAMESPACE_STORAGE_KEY) ?? "No operation yet.",
      );
      setStoredConversationId(
        sessionStorage.getItem(CONVERSATION_STORAGE_KEY) ?? "No operation yet.",
      );
      setStoredReality(
        sessionStorage.getItem(ACTIVE_REALITY_STORAGE_KEY) ?? "None",
      );
      const stored = sessionStorage.getItem(DEBUG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as DebugSnapshot;
        setSnapshot(parsed);
        setJobs(parsed.jobs ?? []);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!pollNamespace || jobIds === "[]") return;
    let cancelled = false;
    async function refresh() {
      try {
        const response = await fetch("/api/memwal/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            namespace: pollNamespace,
            jobIds: JSON.parse(jobIds) as string[],
          }),
        });
        const data = (await response.json()) as { jobs?: MemoryJob[] };
        if (!cancelled && response.ok && data.jobs) setJobs(data.jobs);
      } catch {
        // Keep the last known submitted state when inspection is unavailable.
      }
    }
    void refresh();
    const interval = window.setInterval(refresh, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [pollNamespace, jobIds]);

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

  const namespace = snapshot?.namespace ?? storedNamespace;
  const conversationId = snapshot?.conversationId ?? storedConversationId;
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Badge>Engine: {status?.engineLabel ?? "Loading…"}</Badge>
        <h1 className="text-3xl font-bold">Debug</h1>
        <p className="text-[var(--muted)]">
          Developer Memory Inspector. Configuration values are status-only;
          secrets are never returned.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold">Runtime</h2>
          <dl className="space-y-3 text-sm">
            <Row label="Prompt mode" value={status?.promptMode ?? "Loading…"} />
            <Row label="Prompt file" value={status?.promptFile ?? "Loading…"} />
            <Row
              label="Engine label"
              value={status?.engineLabel ?? "Loading…"}
            />
            <Row label="Namespace" value={namespace} />
            <Row
              label="Selected character"
              value={
                snapshot?.characterName
                  ? `${snapshot.characterName} / ${snapshot.characterSlug ?? "unknown slug"}`
                  : "No character selected"
              }
            />
            <Row
              label="Active reality"
              value={
                snapshot?.activeReality
                  ? `${snapshot.activeRealityName ?? "Unknown name"} / ${snapshot.activeReality}`
                  : storedReality
              }
            />
            <Row
              label="Request action"
              value={snapshot?.requestAction ?? "No request yet"}
            />
            <Row
              label="Write tools enabled"
              value={snapshot?.writeToolsEnabled ? "YES" : "NO"}
            />
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
          </dl>
        </Card>
      </div>
      {status?.scopedCanonEnabled && (
        <Card>
          <h2 className="mb-4 font-semibold">Scoped Canon architecture</h2>
          <dl className="space-y-3 text-sm">
            <Row label="Normal recall rule" value="CORE + ACTIVE REALITY" />
            <Row
              label="Normal dedup rule"
              value="Exact applicable scope only"
            />
            <Row
              label="Unrelated reality rule"
              value="Unrelated realities excluded from normal recall, deduplication, and contradiction checking."
            />
          </dl>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <ScopeBox
              title="CORE namespaces recalled"
              namespaces={scopeNamespaces(snapshot, "core")}
            />
            <ScopeBox
              title="ACTIVE REALITY namespaces recalled"
              namespaces={scopeNamespaces(snapshot, "reality")}
            />
            <ScopeBox
              title="Excluded realities"
              namespaces={[
                "All unrelated realities (by normal scoped-recall rule)",
              ]}
            />
          </div>
        </Card>
      )}
      <Card>
        <h2 className="mb-4 font-semibold">Preloaded canon</h2>
        {!snapshot?.preloadedCanon?.length ? (
          <p className="text-sm text-[var(--muted)]">
            No canon was preloaded for the latest request.
          </p>
        ) : (
          <div className="space-y-3">
            {snapshot.preloadedCanon.map((memory, index) => (
              <dl
                key={`${memory.namespace}-${memory.blobId}-${index}`}
                className="grid gap-2 rounded-lg bg-black/20 p-4 text-xs sm:grid-cols-[9rem_1fr]"
              >
                <Row label="Namespace" value={memory.namespace} />
                <Row label="Memory text" value={memory.text} />
                <Row label="Blob ID" value={memory.blobId} />
                <Row label="Distance" value={String(memory.distance)} />
              </dl>
            ))}
          </div>
        )}
        {!!snapshot?.preloadErrors?.length && (
          <div className="mt-4 space-y-2 text-xs text-red-200">
            {snapshot.preloadErrors.map((item) => (
              <p key={item.namespace}>
                {item.namespace}: {item.error}
              </p>
            ))}
          </div>
        )}
      </Card>
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
        <h2 className="mb-4 font-semibold">Submitted memory jobs</h2>
        {!jobs.length ? (
          <p className="text-sm text-[var(--muted)]">No write submitted yet.</p>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.jobId}
                className="rounded-lg bg-black/20 p-4 text-sm"
              >
                <dl className="grid gap-2 text-xs sm:grid-cols-[9rem_1fr]">
                  <Row label="Operation" value={job.operation} />
                  <Row label="Namespace" value={job.namespace} />
                  <Row label="Candidate" value={job.candidate} />
                  <Row
                    label="Dedup recall"
                    value={JSON.stringify(job.dedupRecall)}
                  />
                  <Row label="Job ID" value={job.jobId} />
                  <Row label="Current state" value={job.state} />
                  <Row
                    label="Blob ID"
                    value={job.blobId ?? "Not available yet."}
                  />
                  {job.error && <Row label="Error" value={job.error} />}
                </dl>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card>
        <h2 className="mb-4 font-semibold">
          Most recent memory tool operations
        </h2>
        {!snapshot?.operations.length ? (
          <p className="text-sm text-[var(--muted)]">No operation yet.</p>
        ) : (
          <div className="space-y-3">
            {snapshot.operations.map((operation, index) => (
              <div
                key={operation.operation + "-" + index}
                className="rounded-lg bg-black/20 p-4 text-sm"
              >
                <div className="mb-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-violet-200">
                  <span>Operation: {operation.operation}</span>
                  <span>Namespace: {operation.namespace}</span>
                </div>
                <pre className="overflow-auto text-xs whitespace-pre-wrap">
                  {JSON.stringify(
                    operation.error
                      ? { input: operation.input, error: operation.error }
                      : { input: operation.input, result: operation.result },
                    null,
                    2,
                  )}
                </pre>
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

function scopeNamespaces(
  snapshot: DebugSnapshot | null,
  scope: "core" | "reality",
) {
  const marker =
    scope === "core"
      ? "::core::"
      : `::reality::${snapshot?.activeReality ?? ""}::`;
  return Array.from(
    new Set(
      (snapshot?.operations ?? [])
        .filter(
          (item) =>
            item.operation === "recall" && item.namespace.includes(marker),
        )
        .map((item) => item.namespace),
    ),
  );
}

function ScopeBox({
  title,
  namespaces,
}: {
  title: string;
  namespaces: string[];
}) {
  return (
    <div className="rounded-xl bg-[var(--surface-high)] p-4">
      <h3 className="text-sm font-bold">{title}</h3>
      {namespaces.length ? (
        <ul className="mt-2 space-y-1 font-mono text-xs break-all">
          {namespaces.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-[var(--muted)]">
          None in the latest snapshot.
        </p>
      )}
    </div>
  );
}
