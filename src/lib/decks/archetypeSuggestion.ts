interface ArchetypeSuggestionCard {
  quantity?: number;

  zone?: string | null;

  card: {
    archetype?: string | null;
  };
}

export interface ArchetypeSuggestionInput {
  name?: string | null;

  skill?: string | null;

  cards: ReadonlyArray<ArchetypeSuggestionCard>;
}

/**
 * Normaliza texto para comparaciones: minúsculas, sin
 * acentos y con los separadores convertidos en espacios.
 */
function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Suma las copias de cada arquetipo. Cuando se indica una
 * zona solo se tienen en cuenta las cartas de esa zona.
 */
function countArchetypesByZone(
  cards: ReadonlyArray<ArchetypeSuggestionCard>,
  zone?: string
): Map<string, number> {
  const counter = new Map<string, number>();

  for (const card of cards) {
    if (
      zone !== undefined &&
      (card.zone ?? "main") !== zone
    ) {
      continue;
    }

    const archetype =
      card.card.archetype?.trim();

    if (!archetype) {
      continue;
    }

    const quantity = Math.max(
      card.quantity ?? 1,
      1
    );

    counter.set(
      archetype,
      (counter.get(archetype) ?? 0) +
        quantity
    );
  }

  return counter;
}

/**
 * Devuelve los arquetipos presentes en el mazo que
 * aparecen como palabra completa en el texto indicado.
 */
export function matchArchetypesInText(
  text: string | null | undefined,
  archetypes: readonly string[]
): string[] {
  const haystack = normalizeText(text ?? "");

  if (!haystack) {
    return [];
  }

  return archetypes.filter((archetype) => {
    const needle = normalizeText(archetype);

    if (!needle) {
      return false;
    }

    return new RegExp(
      `(^|\\s)${escapeRegExp(needle)}(\\s|$)`
    ).test(haystack);
  });
}

/**
 * Elige el arquetipo más relevante entre los que aparecen
 * en el título o la Skill. Se pondera por copias del Main
 * Deck, luego por copias totales y, por último, por el
 * orden en el que aparece en el texto.
 */
function pickBestMatch(
  matches: readonly string[],
  mainCounter: Map<string, number>,
  allCounter: Map<string, number>,
  text: string
): string {
  const haystack = normalizeText(text);

  return [...matches].sort((a, b) => {
    const mainDiff =
      (mainCounter.get(b) ?? 0) -
      (mainCounter.get(a) ?? 0);

    if (mainDiff !== 0) {
      return mainDiff;
    }

    const allDiff =
      (allCounter.get(b) ?? 0) -
      (allCounter.get(a) ?? 0);

    if (allDiff !== 0) {
      return allDiff;
    }

    const positionA = haystack.indexOf(
      normalizeText(a)
    );

    const positionB = haystack.indexOf(
      normalizeText(b)
    );

    if (positionA !== positionB) {
      return positionA - positionB;
    }

    return a.localeCompare(b);
  })[0];
}

function getDominantArchetype(
  counter: Map<string, number>
): string | null {
  const entries = [...counter.entries()];

  if (entries.length === 0) {
    return null;
  }

  entries.sort(
    (a, b) =>
      b[1] - a[1] ||
      a[0].localeCompare(b[0])
  );

  return entries[0][0];
}

/**
 * Sugiere el arquetipo de un mazo usando la misma
 * prioridad que Duel Links Meta:
 *
 * 1. Arquetipo mencionado en el título del mazo.
 * 2. Arquetipo mencionado en la Skill.
 * 3. Arquetipo con más copias en el Main Deck.
 * 4. Arquetipo con más copias en todo el mazo.
 */
export function suggestArchetypeName({
  name,
  skill,
  cards,
}: ArchetypeSuggestionInput): string | null {
  const mainCounter = countArchetypesByZone(
    cards,
    "main"
  );

  const allCounter =
    countArchetypesByZone(cards);

  const archetypes = [
    ...allCounter.keys(),
  ];

  if (archetypes.length === 0) {
    return null;
  }

  const titleMatches = matchArchetypesInText(
    name,
    archetypes
  );

  if (titleMatches.length > 0) {
    return pickBestMatch(
      titleMatches,
      mainCounter,
      allCounter,
      name ?? ""
    );
  }

  const skillMatches = matchArchetypesInText(
    skill,
    archetypes
  );

  if (skillMatches.length > 0) {
    return pickBestMatch(
      skillMatches,
      mainCounter,
      allCounter,
      skill ?? ""
    );
  }

  return (
    getDominantArchetype(mainCounter) ??
    getDominantArchetype(allCounter)
  );
}
