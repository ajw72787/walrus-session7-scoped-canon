export const CHARACTER_STORAGE_KEY = "walrus-s7-character";
export const NAMESPACE_STORAGE_KEY = "walrus-s7-namespace";
export const CONVERSATION_STORAGE_KEY = "walrus-s7-conversation";
export const DEBUG_STORAGE_KEY = "walrus-s7-debug";
export const ACTIVE_REALITY_STORAGE_KEY = "walrus-s7-active-reality";

export type Character = {
  name: string;
  type: string;
  appearance: string;
  ability: string;
  likes: string;
  fear: string;
  details: string;
};

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type MemoryJob = {
  operation: "remember" | "remember_bulk";
  namespace: string;
  candidate: string;
  dedupRecall: unknown;
  jobId: string;
  state:
    "submitted" | "pending" | "running" | "uploaded" | "completed" | "failed";
  blobId?: string;
  error?: string;
};

export type DebugSnapshot = {
  namespace: string;
  activeReality: string | null;
  conversationId: string;
  operations: Array<{
    operation: "recall" | "remember" | "remember_bulk" | "analyze";
    namespace: string;
    input: unknown;
    result?: unknown;
    error?: string;
  }>;
  jobs: MemoryJob[];
};

export function createConversationId() {
  const browserCrypto = globalThis.crypto;

  if (typeof browserCrypto?.randomUUID === "function") {
    return browserCrypto.randomUUID();
  }

  if (typeof browserCrypto?.getRandomValues === "function") {
    const bytes = browserCrypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));

    return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
  }

  return `conversation-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
