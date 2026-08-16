import "server-only";
import {
  MemWal,
  type AnalyzeResult,
  type HealthResult,
  type RecallMemory,
  type RememberBulkAcceptedResult,
  type RememberBulkStatusResult,
  type RememberAcceptedResult,
  type RememberJobStatus,
} from "@mysten-incubation/memwal";

export type MemWalStatus = {
  configured: boolean;
  serverUrlConfigured: boolean;
  missing: string[];
};

export function getMemWalStatus(): MemWalStatus {
  const missing = ["MEMWAL_PRIVATE_KEY", "MEMWAL_ACCOUNT_ID"].filter(
    (name) => !process.env[name],
  );
  return {
    configured: missing.length === 0,
    serverUrlConfigured: Boolean(process.env.MEMWAL_SERVER_URL),
    missing,
  };
}

function client(namespace?: string) {
  const status = getMemWalStatus();
  if (!status.configured)
    throw new Error(
      `MemWal is not configured. Missing: ${status.missing.join(", ")}`,
    );
  return MemWal.create({
    key: process.env.MEMWAL_PRIVATE_KEY!,
    accountId: process.env.MEMWAL_ACCOUNT_ID!,
    serverUrl:
      process.env.MEMWAL_SERVER_URL ?? "https://relayer.memory.walrus.xyz",
    namespace,
  });
}

export async function health(): Promise<HealthResult> {
  const memwal = client();
  try {
    return await memwal.health();
  } finally {
    memwal.destroy();
  }
}

export async function recall(
  namespace: string,
  query: string,
  limit = 10,
): Promise<RecallMemory[]> {
  const memwal = client(namespace);
  try {
    return (await memwal.recall({ query, namespace, limit })).results;
  } finally {
    memwal.destroy();
  }
}

// Intentionally server-only and not exposed by an API route in the baseline harness.
export async function remember(
  namespace: string,
  text: string,
): Promise<RememberAcceptedResult> {
  const memwal = client(namespace);
  try {
    return await memwal.remember(text, namespace);
  } finally {
    memwal.destroy();
  }
}

export async function rememberBulk(
  items: Array<{ text: string; namespace: string }>,
): Promise<RememberBulkAcceptedResult> {
  const memwal = client();
  try {
    // The installed SDK accepts per-item namespaces rather than the prompt's
    // remember_bulk(facts[], namespace) shape. This preserves one batch while
    // allowing each canonical fact to reach its required child namespace.
    return await memwal.rememberBulk(items);
  } finally {
    memwal.destroy();
  }
}

export async function rememberStatus(
  jobId: string,
): Promise<RememberJobStatus> {
  const memwal = client();
  try {
    return await memwal.getRememberStatus(jobId);
  } finally {
    memwal.destroy();
  }
}

export async function rememberBulkStatus(
  jobIds: string[],
): Promise<RememberBulkStatusResult> {
  const memwal = client();
  try {
    return await memwal.getRememberBulkStatus(jobIds);
  } finally {
    memwal.destroy();
  }
}
export async function analyze(
  namespace: string,
  text: string,
): Promise<AnalyzeResult> {
  const memwal = client(namespace);
  try {
    return await memwal.analyze(text, namespace);
  } finally {
    memwal.destroy();
  }
}
