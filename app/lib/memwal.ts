import "server-only";
import {
  MemWal,
  type HealthResult,
  type RecallMemory,
  type RememberResult,
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
): Promise<RecallMemory[]> {
  const memwal = client(namespace);
  try {
    return (await memwal.recall({ query, namespace, limit: 10 })).results;
  } finally {
    memwal.destroy();
  }
}

// Intentionally server-only and not exposed by an API route in the baseline harness.
export async function remember(
  namespace: string,
  text: string,
): Promise<RememberResult> {
  const memwal = client(namespace);
  try {
    return await memwal.rememberAndWait(text, namespace);
  } finally {
    memwal.destroy();
  }
}
