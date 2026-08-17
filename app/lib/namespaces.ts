const SLUG = "[a-z0-9]+(?:-[a-z0-9]+)*";
const ENTITY_TYPE = "(?:char|place|object|rule|term)";
const ENTITY_SLUG = "[a-z0-9][a-z0-9'-]*(?:-[a-z0-9][a-z0-9'-]*)*";

export function isCanonNamespace(
  selectedStory: string,
  requested: string,
): boolean {
  const story = escapeRegExp(selectedStory);
  const original = `(?:${ENTITY_TYPE}::${ENTITY_SLUG}|events|timeline|relationships)`;
  const core = `core::(?:${ENTITY_TYPE}::${ENTITY_SLUG}|relationships)`;
  const reality = `reality::${SLUG}::(?:${ENTITY_TYPE}::${ENTITY_SLUG}|events|timeline|relationships)`;

  return new RegExp(`^${story}::(?:${original}|${core}|${reality})$`).test(
    requested,
  );
}

export function getCanonScopeRoot(
  selectedStory: string,
  namespace: string,
): string {
  const scoped = namespace.match(
    new RegExp(`^${escapeRegExp(selectedStory)}::(core|reality::${SLUG})::`),
  );
  return scoped ? `${selectedStory}::${scoped[1]}` : selectedStory;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
