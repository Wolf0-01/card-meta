import type { MetaDeck } from "@/types/meta";

/**
 * Nombre visible del arquetipo de un mazo.
 *
 * El mapper histórico usa "Unknown" cuando el mazo no tiene
 * arquetipo asociado. En ese caso se deduce del arquetipo de
 * las cartas del Main Deck, luego del tipo de carta dominante
 * y, como último recurso, del nombre del mazo.
 */
export function getDeckArchetypeLabel(
  deck: Pick<
    MetaDeck,
    "archetype" | "archetypeName" | "name" | "cards"
  >
): string {
  const explicit = deck.archetype?.name?.trim();

  if (
    explicit &&
    explicit.toLowerCase() !== "unknown"
  ) {
    return explicit;
  }

  const alias = deck.archetypeName?.trim();

  if (
    alias &&
    alias.toLowerCase() !== "unknown"
  ) {
    return alias;
  }

  const mainCards = deck.cards.filter(
    (item) => item.zone === "main"
  );

  const pool =
    mainCards.length > 0
      ? mainCards
      : deck.cards;

  const archetypeCounts =
    new Map<string, number>();

  for (const item of pool) {
    const name =
      item.card.archetype?.trim();

    if (!name) {
      continue;
    }

    archetypeCounts.set(
      name,
      (archetypeCounts.get(name) ?? 0) +
        (item.quantity || 1)
    );
  }

  const topArchetype = [
    ...archetypeCounts.entries(),
  ].sort(
    (a, b) =>
      b[1] - a[1] ||
      a[0].localeCompare(b[0])
  )[0]?.[0];

  if (topArchetype) {
    return topArchetype;
  }

  const typeCounts = new Map<string, number>();

  for (const item of pool) {
    const type = item.card.type?.trim();

    if (!type) {
      continue;
    }

    typeCounts.set(
      type,
      (typeCounts.get(type) ?? 0) +
        (item.quantity || 1)
    );
  }

  const topType = [...typeCounts.entries()].sort(
    (a, b) =>
      b[1] - a[1] ||
      a[0].localeCompare(b[0])
  )[0]?.[0];

  return (
    deck.name.trim() ||
    topType ||
    "Deck"
  );
}
