import type { DeckCard } from "@/types/deck";

import type { MetaDeck } from "@/types/meta";

const RARITY_SCORE: Record<string, number> = {
  UR: 40,
  SR: 30,
  R: 20,
  N: 10,
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function scoreCard(
  card: DeckCard,
  deckName: string,
  archetypeName: string
): number {
  const name = normalize(card.card.name);

  let score =
    RARITY_SCORE[
      card.card.rarity?.toUpperCase() ?? ""
    ] ?? 5;

  score +=
    Math.min(card.quantity ?? 1, 3) * 3;

  if (/monster/i.test(card.card.type)) {
    score += 25;
  }

  if (deckName && name.includes(deckName)) {
    score += 120;
  }

  if (
    archetypeName &&
    name.includes(archetypeName)
  ) {
    score += 90;
  }

  return score;
}

/**
 * Elige la carta más representativa del mazo para usarla
 * como miniatura: prioriza coincidencias con el nombre o
 * arquetipo, luego monstruos y rareza.
 */
export function pickDeckEmblem(
  deck: MetaDeck | null | undefined
): DeckCard | null {
  if (!deck) {
    return null;
  }

  const cards = deck.cards ?? [];

  const mainDeck = cards.filter(
    (card) => card.zone === "main"
  );

  const pool =
    mainDeck.length > 0 ? mainDeck : cards;

  const deckName = normalize(deck.name ?? "");

  const archetypeName = normalize(
    deck.archetype?.name ??
      deck.archetypeName ??
      ""
  );

  let best: DeckCard | null = null;

  let bestScore = Number.NEGATIVE_INFINITY;

  for (const card of pool) {
    if (
      !card.card.image &&
      !card.card.ygoproId
    ) {
      continue;
    }

    const score = scoreCard(
      card,
      deckName,
      archetypeName
    );

    if (score > bestScore) {
      best = card;
      bestScore = score;
    }
  }

  return best;
}
