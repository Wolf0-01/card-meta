import { MetaDeck } from "@/types/meta";

export function splitDeckCards(deck: MetaDeck) {
  const cards = deck.cards ?? [];

  return {
    mainDeck: cards.filter((card) => card.zone === "main"),
    extraDeck: cards.filter((card) => card.zone === "extra"),
    sideDeck: cards.filter((card) => card.zone === "side"),
  };
}

export function countDeckCards(
  cards: MetaDeck["cards"] = []
) {
  return cards.reduce(
    (total, card) => total + (card.quantity ?? 1),
    0
  );
}

export function getTotalCards(deck: MetaDeck) {
  return (
    deck.totalCards ??
    countDeckCards(deck.cards ?? [])
  );
}