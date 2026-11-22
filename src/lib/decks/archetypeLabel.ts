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
): string {  const explicit = deck.archetype?.name?.trim();

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

/**
 * Convierte cualquier nombre o slug de arquetipo en un slug
 * URL-safe: "Dark Magician" y "Dark%20Magician" producen
 * "dark-magician".
 */
export function slugifyArchetypeLabel(
  value: string
): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Slug canónico del arquetipo de un mazo. Prioriza la
 * relación explícita y, si no existe, deriva el slug del
 * nombre visible para que los enlaces nunca envíen el
 * nombre crudo codificado.
 */
export function getDeckArchetypeSlug(
  deck: Pick<
    MetaDeck,
    | "archetype"
    | "archetypeSlug"
    | "archetypeName"
    | "name"
    | "cards"
  >
): string {
  const explicit =
    deck.archetype?.slug?.trim() ||
    deck.archetypeSlug?.trim();

  if (explicit) {
    const slug = slugifyArchetypeLabel(explicit);

    if (slug) {
      return slug;
    }
  }

  return (
    slugifyArchetypeLabel(
      getDeckArchetypeLabel(deck)
    ) || "deck"
  );
}
