export const CHARACTER_STORAGE_KEY = "walrus-s7-character";
export const NAMESPACE_STORAGE_KEY = "walrus-s7-namespace";
export const CONVERSATION_STORAGE_KEY = "walrus-s7-conversation";
export const DEBUG_STORAGE_KEY = "walrus-s7-debug";

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

export type DebugSnapshot = {
  namespace: string;
  conversationId: string;
  recalledMemories: Array<{ blobId: string; text: string; distance: number }>;
  mostRecentWriteBlobId: string | null;
};

export function createConversationId() {
  return crypto.randomUUID();
}
