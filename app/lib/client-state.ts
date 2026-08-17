export const CHARACTER_STORAGE_KEY = "walrus-s7-character";
export const CHARACTERS_STORAGE_KEY = "walrus-s7-characters";
export const SELECTION_STORAGE_KEY = "walrus-s7-selection";
export const NAMESPACE_STORAGE_KEY = "walrus-s7-namespace";
export const CONVERSATION_STORAGE_KEY = "walrus-s7-conversation";
export const DEBUG_STORAGE_KEY = "walrus-s7-debug";
export const ACTIVE_REALITY_STORAGE_KEY = "walrus-s7-active-reality";
export const STORY_HISTORY_STORAGE_KEY = "walrus-s7-story-history";

export type Character = {
  id: string;
  name: string;
  type: string;
  appearance: string;
  personality: string;
  ability: string;
  likes: string;
  fear: string;
  details: string;
  summary: string;
  worlds: World[];
  createdAt: string;
};

export type World = {
  id: string;
  name: string;
  description: string;
  inspiration?: string;
};

export type Selection = {
  characterId: string | null;
  worldId: string | null;
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
  characterName?: string;
  characterSlug?: string;
  activeReality: string | null;
  activeRealityName?: string;
  conversationId: string;
  requestAction?: "continue" | "finalize";
  writeToolsEnabled?: boolean;
  preloadedCanon?: PreloadedCanonMemory[];
  preloadErrors?: Array<{ namespace: string; error: string }>;
  operations: Array<{
    operation: "recall" | "remember" | "remember_bulk" | "analyze";
    namespace: string;
    input: unknown;
    result?: unknown;
    error?: string;
  }>;
  jobs: MemoryJob[];
};

export type PreloadedCanonMemory = {
  namespace: string;
  text: string;
  blobId: string;
  distance: number;
};

export function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "story"
  );
}

export function storySlug(character: Pick<Character, "id">): string {
  return `story-${character.id}`;
}

export function loadCharacters(): Character[] {
  if (typeof window === "undefined") return [];
  try {
    const value = localStorage.getItem(CHARACTERS_STORAGE_KEY);
    return value ? (JSON.parse(value) as Character[]) : [];
  } catch {
    return [];
  }
}

export function saveCharacters(characters: Character[]): void {
  localStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(characters));
}

export function loadSelection(): Selection {
  try {
    const value = localStorage.getItem(SELECTION_STORAGE_KEY);
    return value
      ? (JSON.parse(value) as Selection)
      : { characterId: null, worldId: null };
  } catch {
    return { characterId: null, worldId: null };
  }
}

export function saveSelection(selection: Selection): void {
  localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(selection));
  const character = loadCharacters().find(
    (item) => item.id === selection.characterId,
  );
  const world = character?.worlds.find((item) => item.id === selection.worldId);
  if (character)
    sessionStorage.setItem(NAMESPACE_STORAGE_KEY, storySlug(character));
  if (world) sessionStorage.setItem(ACTIVE_REALITY_STORAGE_KEY, world.id);
  else sessionStorage.removeItem(ACTIVE_REALITY_STORAGE_KEY);
}

export function createConversationId() {
  const browserCrypto = globalThis.crypto;
  if (typeof browserCrypto?.randomUUID === "function")
    return browserCrypto.randomUUID();
  return `conversation-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function storyConversationStorageKey(
  characterId: string,
  realitySlug: string,
): string {
  return `${CONVERSATION_STORAGE_KEY}:${characterId}:${realitySlug}`;
}

export function storyHistoryStorageKey(
  characterId: string,
  realitySlug: string,
): string {
  return `${STORY_HISTORY_STORAGE_KEY}:${characterId}:${realitySlug}`;
}
