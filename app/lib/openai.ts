import "server-only";
import {
  slugify,
  type ChatMessage,
  type MemoryJob,
  type PreloadedCanonMemory,
} from "@/lib/client-state";
import { trackMemoryJob } from "@/lib/memory-jobs";
import { recall, remember, rememberBulk } from "@/lib/memwal";
import {
  getCanonScopeRoot,
  getStoryRecallNamespaces,
  isCanonNamespace,
} from "@/lib/namespaces";
import type { PromptMode } from "@/lib/prompt";
import {
  CHILD_STORYTELLER_INSTRUCTIONS,
  actionInstructions,
  formatCharacterContext,
  formatWorldContext,
  type StoryAction,
  type StoryCharacterContext,
  type StoryWorldContext,
} from "@/lib/storyteller";
type Item = {
  type?: string;
  name?: string;
  call_id?: string;
  arguments?: string;
  content?: Array<{ type?: string; text?: string }>;
};
export type MemoryToolOperation = {
  operation: "recall" | "remember" | "remember_bulk" | "analyze";
  namespace: string;
  input: unknown;
  result?: unknown;
  error?: string;
};
const ns = {
  type: "string",
  description:
    "An exact valid Continuity Keeper child namespace for the selected story. The bare story root is invalid.",
};
const recallTool = {
  type: "function",
  name: "memwal_recall",
  description:
    "Recall canon before writing or recall a candidate for deduplication.",
  strict: true,
  parameters: {
    type: "object",
    properties: {
      query: { type: "string" },
      namespace: ns,
      limit: { type: "integer", minimum: 1, maximum: 10 },
    },
    required: ["query", "namespace", "limit"],
    additionalProperties: false,
  },
};
const writeTools = [
  {
    type: "function",
    name: "memwal_remember",
    description:
      "Store one durable fact only after finalization and deduplication.",
    strict: true,
    parameters: {
      type: "object",
      properties: { text: { type: "string" }, namespace: ns },
      required: ["text", "namespace"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "memwal_remember_bulk",
    description:
      "Store up to 20 deduplicated durable facts in target story namespaces.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        facts: {
          type: "array",
          minItems: 1,
          maxItems: 20,
          items: {
            type: "object",
            properties: { text: { type: "string" }, namespace: ns },
            required: ["text", "namespace"],
            additionalProperties: false,
          },
        },
      },
      required: ["facts"],
      additionalProperties: false,
    },
  },
];

const installedSdkCompatibility = `
Installed SDK compatibility rules (follow these in place of invoking memwal_analyze):
- memwal_analyze is unavailable in this route because this SDK persists its extracted facts immediately. Never call it.
- When the author finalizes prose, you must extract candidate durable facts yourself, using the prompt's exact note schema.
- Derive each candidate's exact child namespace from its canon type and entity, recall the full candidate text in that exact namespace, and evaluate the returned distances before writing.
- A write is rejected unless that exact candidate recall happened first. Never use the bare story root.
- remember_bulk accepts per-fact namespaces in this installed SDK; this is only a signature difference. Use one batch for the deduplicated survivors.
- An accepted job is submitted/pending, not completed or failed. Never say memory was not recorded merely because no blob ID exists yet.
`;
export function getOpenAIStatus() {
  return {
    configured: Boolean(process.env.OPENAI_API_KEY),
    model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
  };
}
export async function generateResponse(
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string,
  storyNamespace: string,
  promptMode: PromptMode,
  activeReality: string | null,
  action: StoryAction,
  character: StoryCharacterContext,
  world: StoryWorldContext | null,
) {
  if (!process.env.OPENAI_API_KEY)
    throw new Error(
      "OpenAI is not configured. Set OPENAI_API_KEY on the server.",
    );
  let input: unknown[] = [...history, { role: "user", content: userMessage }];
  const operations: MemoryToolOperation[] = [];
  const jobs: MemoryJob[] = [];
  const preload =
    action === "continue" && promptMode === "scoped" && activeReality && world
      ? await preloadCanon(
          storyNamespace,
          activeReality,
          character,
          world,
          operations,
        )
      : { memories: [], errors: [] };
  const availableTools =
    action === "finalize" ? [recallTool, ...writeTools] : [recallTool];
  for (let turn = 0; turn < 12; turn += 1) {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.OPENAI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
        instructions: [
          "CANON OPERATIONAL PROMPT\n" + systemPrompt,
          "APPLICATION COMPATIBILITY RULES\n" + installedSdkCompatibility,
          "CHILD STORYTELLER INSTRUCTIONS\n" + CHILD_STORYTELLER_INSTRUCTIONS,
          formatCharacterContext(character),
          formatWorldContext(world),
          formatCanonContext(preload.memories),
          `REQUEST CONTEXT\n- Action: ${action}\n- Selected story slug: ${storyNamespace}\n- Prompt mode: ${promptMode}\n- Active reality: ${activeReality ?? "none"}\n- Durable write tools enabled: ${action === "finalize" ? "YES" : "NO"}\n${actionInstructions(action)}`,
        ].join("\n\n---\n\n"),
        input,
        tools: availableTools,
        tool_choice: "auto",
      }),
    });
    const payload = (await response.json()) as {
      error?: { message?: string };
      output_text?: string;
      output?: Item[];
    };
    if (!response.ok)
      throw new Error(
        payload.error?.message ??
          "OpenAI request failed (" + response.status + ").",
      );
    const calls = (payload.output ?? []).filter(
      (x) => x.type === "function_call" && x.name && x.call_id,
    );
    if (calls.length) {
      const outputs = await Promise.all(
        calls.map(async (c) => ({
          type: "function_call_output",
          call_id: c.call_id,
          output: await run(
            c.name!,
            c.arguments ?? "{}",
            storyNamespace,
            operations,
            jobs,
            action,
          ),
        })),
      );
      input = [...input, ...(payload.output ?? []), ...outputs];
      continue;
    }
    const text =
      payload.output_text ??
      payload.output
        ?.flatMap((x) => x.content ?? [])
        .filter((x) => x.type === "output_text")
        .map((x) => x.text ?? "")
        .join("\n");
    if (!text) throw new Error("OpenAI returned no text response.");
    return {
      text,
      operations,
      jobs,
      preloadedCanon: preload.memories,
      preloadErrors: preload.errors,
      writeToolsEnabled: action === "finalize",
    };
  }
  throw new Error("OpenAI exceeded the memory tool-call limit.");
}
function guard(
  selected: string,
  requested: unknown,
): asserts requested is string {
  if (typeof requested !== "string" || !isCanonNamespace(selected, requested))
    throw new Error(
      "Namespace must be a valid Continuity Keeper child of " +
        selected +
        "; the bare story root is not allowed.",
    );
}
async function run(
  name: string,
  raw: string,
  selected: string,
  operations: MemoryToolOperation[],
  jobs: MemoryJob[],
  action: StoryAction,
) {
  let args: Record<string, unknown>;
  try {
    args = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return JSON.stringify({ error: "Invalid JSON tool arguments." });
  }
  const operation: MemoryToolOperation = {
    operation: name.replace("memwal_", "") as MemoryToolOperation["operation"],
    namespace: String(
      name === "memwal_remember_bulk" ? selected : args.namespace,
    ),
    input: args,
  };
  operations.push(operation);
  try {
    let result: unknown;
    if (name === "memwal_recall") {
      guard(selected, args.namespace);
      result = await recall(
        args.namespace,
        String(args.query),
        Number(args.limit),
      );
    } else if (name === "memwal_remember") {
      if (action !== "finalize")
        throw new Error(
          "Durable memory writes are disabled for continue actions.",
        );
      guard(selected, args.namespace);
      const candidate = String(args.text);
      const dedupRecall = requireDedup(operations, args.namespace, candidate);
      requireCandidateNamespace(selected, args.namespace, candidate);
      const accepted = await remember(args.namespace, candidate);
      result = { ...accepted, state: "submitted" };
      addJob(
        selected,
        jobs,
        "remember",
        args.namespace,
        candidate,
        dedupRecall,
        accepted.job_id,
      );
    } else if (name === "memwal_remember_bulk") {
      if (action !== "finalize")
        throw new Error(
          "Durable memory writes are disabled for continue actions.",
        );
      const facts = args.facts as Array<{ text: string; namespace: string }>;
      const recalls = facts.map((fact) => {
        guard(selected, fact.namespace);
        requireCandidateNamespace(selected, fact.namespace, fact.text);
        return requireDedup(operations, fact.namespace, fact.text);
      });
      const accepted = await rememberBulk(facts);
      result = { ...accepted, state: "submitted" };
      accepted.job_ids.forEach((jobId, index) =>
        addJob(
          selected,
          jobs,
          "remember_bulk",
          facts[index].namespace,
          facts[index].text,
          recalls[index],
          jobId,
        ),
      );
    } else throw new Error("Unknown or unavailable tool: " + name);
    operation.result = result;
    return JSON.stringify(result);
  } catch (error) {
    operation.error =
      error instanceof Error ? error.message : "Memory tool failed.";
    return JSON.stringify({ error: operation.error });
  }
}

async function preloadCanon(
  story: string,
  activeReality: string,
  character: StoryCharacterContext,
  world: StoryWorldContext,
  operations: MemoryToolOperation[],
): Promise<{
  memories: PreloadedCanonMemory[];
  errors: Array<{ namespace: string; error: string }>;
}> {
  const characterSlug = slugify(character.name);
  const scoped = getStoryRecallNamespaces(
    story,
    characterSlug,
    activeReality,
    world.id,
  );
  const namespaces = [...scoped.core, ...scoped.reality];
  const query = `${character.name} in ${world.name}: identity, relationships, setting, and recent lasting story canon`;
  const errors: Array<{ namespace: string; error: string }> = [];
  const groups = await Promise.all(
    namespaces.map(async (namespace) => {
      const operation: MemoryToolOperation = {
        operation: "recall",
        namespace,
        input: { query, limit: 10, source: "deterministic-preload" },
      };
      operations.push(operation);
      try {
        const results = await recall(namespace, query, 10);
        operation.result = results;
        return results.map((memory) => ({
          namespace,
          text: memory.text,
          blobId: memory.blob_id,
          distance: memory.distance,
        }));
      } catch (cause) {
        const error =
          cause instanceof Error ? cause.message : "Canon preload failed.";
        operation.error = error;
        errors.push({ namespace, error });
        return [];
      }
    }),
  );
  const memories = groups
    .flat()
    .filter(
      (memory, index, all) =>
        all.findIndex(
          (candidate) =>
            candidate.namespace === memory.namespace &&
            candidate.blobId === memory.blobId,
        ) === index,
    );
  return { memories, errors };
}

function formatCanonContext(memories: PreloadedCanonMemory[]): string {
  if (!memories.length)
    return "PRELOADED APPLICABLE CANON\nNo canon was returned. Do not invent recalled facts.";
  return [
    "PRELOADED APPLICABLE CANON",
    "Treat these retrieved notes as authoritative context. Do not reveal their technical metadata to the child.",
    ...memories.map((memory) => `- ${memory.text}`),
  ].join("\n");
}

function requireDedup(
  operations: MemoryToolOperation[],
  namespace: string,
  candidate: string,
): unknown {
  const recalled = [...operations]
    .reverse()
    .find(
      (operation) =>
        operation.operation === "recall" &&
        operation.namespace === namespace &&
        !operation.error &&
        (operation.input as { query?: unknown }).query === candidate,
    );
  if (!recalled)
    throw new Error(
      "Recall this exact candidate in its exact target namespace before writing.",
    );
  const results = recalled.result as Array<{ distance?: number }>;
  if (results.some((memory) => Number(memory.distance) < 0.25))
    throw new Error(
      "Duplicate candidate skipped: nearest distance is below 0.25.",
    );
  return recalled.result;
}

function requireCandidateNamespace(
  story: string,
  namespace: string,
  candidate: string,
): void {
  const match = candidate.match(
    /^\[canon:(char|place|object|rule|term|event|relationship|timeline)\] (.+?) — .+ \(as of: .+\)$/,
  );
  if (!match)
    throw new Error("Candidate does not match the canon note schema.");
  const [, type, entity] = match;
  const suffix =
    type === "event"
      ? "events"
      : type === "relationship"
        ? "relationships"
        : type === "timeline"
          ? "timeline"
          : `${type}::${entity.toLowerCase().trim().replace(/\s+/g, "-")}`;
  const expected = `${getCanonScopeRoot(story, namespace)}::${suffix}`;
  if (namespace !== expected)
    throw new Error(`Candidate must be written to ${expected}.`);
}

function addJob(
  storyNamespace: string,
  jobs: MemoryJob[],
  operation: MemoryJob["operation"],
  namespace: string,
  candidate: string,
  dedupRecall: unknown,
  jobId: string,
): void {
  const job: MemoryJob = {
    operation,
    namespace,
    candidate,
    dedupRecall,
    jobId,
    state: "submitted",
  };
  jobs.push(job);
  trackMemoryJob(storyNamespace, job);
}
