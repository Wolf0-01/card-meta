// src/utils/deck.ts

export type DeckZone =
  | "main"
  | "extra"
  | "side";

interface DeckCard {
  quantity?: number | null;
  zone: DeckZone;
}

// =================================
// WIN RATE
// =================================

export function getWinRate(
  wins: number = 0,
  losses: number = 0
) {
  const total = wins + losses;

  if (total <= 0) {
    return 0;
  }

  return Math.round(
    (wins / total) * 100
  );
}

// =================================
// COUNT CARDS BY ZONE
// =================================

export function countCardsByZone(
  cards: DeckCard[],
  zone: DeckZone
) {
  return cards.reduce(
    (total, card) =>
      card.zone === zone
        ? total + (card.quantity ?? 1)
        : total,
    0
  );
}

// =================================
// TOTAL CARDS
// =================================

export function countTotalCards(
  cards: DeckCard[]
) {
  return cards.reduce(
    (total, card) =>
      total + (card.quantity ?? 1),
    0
  );
}

// =================================
// DECK SIZE
// =================================

export function getDeckSize(
  cards: DeckCard[],
  zone?: DeckZone
) {
  if (!zone) {
    return countTotalCards(cards);
  }

  return countCardsByZone(
    cards,
    zone
  );
}