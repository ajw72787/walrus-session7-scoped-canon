import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

async function loadTypeScriptModule(path) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const javascript = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  return import(
    `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`
  );
}

test("conversation storage is scoped by character and world", async () => {
  const state = await loadTypeScriptModule("../lib/client-state.ts");
  assert.notEqual(
    state.storyHistoryStorageKey("rex", "space-world"),
    state.storyHistoryStorageKey("rex", "pirate-world"),
  );
  assert.notEqual(
    state.storyHistoryStorageKey("rex", "space-world"),
    state.storyHistoryStorageKey("milo", "space-world"),
  );
  assert.notEqual(
    state.storyConversationStorageKey("rex", "space-world"),
    state.storyConversationStorageKey("rex", "pirate-world"),
  );
});

test("storyteller context includes selected character and world", async () => {
  const storyteller = await loadTypeScriptModule("../lib/storyteller.ts");
  const character = storyteller.formatCharacterContext({
    id: "rex",
    name: "Rex",
    type: "fox",
    appearance: "red fur",
    personality: "curious",
    ability: "talks to trees",
    likes: "pancakes",
    fear: "thunder",
    details: "wears a scarf",
    summary: "a curious fox",
  });
  const world = storyteller.formatWorldContext({
    id: "space-world",
    name: "Space World",
    description: "friendly planets",
    inspiration: "Space",
  });
  assert.match(character, /CURRENT CHARACTER/);
  assert.match(character, /Rex/);
  assert.match(world, /CURRENT WORLD/);
  assert.match(world, /Space World/);
  assert.match(world, /Reality slug: space-world/);
});

test("scoped preload excludes unrelated realities and namespace rules remain", async () => {
  const namespaces = await loadTypeScriptModule("../lib/namespaces.ts");
  const selected = namespaces.getStoryRecallNamespaces(
    "story-rex",
    "rex",
    "space-world",
    "space-world",
  );
  assert.ok(selected.core.every((value) => value.includes("::core::")));
  assert.ok(
    selected.reality.every((value) =>
      value.includes("::reality::space-world::"),
    ),
  );
  assert.ok(selected.reality.every((value) => !value.includes("pirate-world")));
  assert.equal(
    namespaces.isCanonNamespace(
      "story-rex",
      "story-rex::reality::space-world::events",
    ),
    true,
  );
  assert.equal(namespaces.isCanonNamespace("story-rex", "story-rex"), false);
});

test("chat contract gates writes by action and never exposes analyze", async () => {
  const route = await readFile(
    new URL("../app/api/chat/route.ts", import.meta.url),
    "utf8",
  );
  const openai = await readFile(
    new URL("../lib/openai.ts", import.meta.url),
    "utf8",
  );
  assert.match(route, /z\.enum\(\["continue", "finalize"\]\)/);
  assert.match(
    openai,
    /action === "finalize" \? \[recallTool, \.\.\.writeTools\] : \[recallTool\]/,
  );
  assert.match(
    openai,
    /Durable memory writes are disabled for continue actions/,
  );
  assert.doesNotMatch(openai, /name:\s*"memwal_analyze"/);
  assert.match(openai, /promptMode === "scoped"/);
});
