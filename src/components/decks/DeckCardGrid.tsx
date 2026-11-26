"use client";

import DeckCardItem from "./DeckCardItem";

import { sortDeckCards } from "@/lib/decks/rarityOrder";

import type { DeckCard } from "@/types/deck";

interface DeckCardGridProps {
  cards: DeckCard[];
}

export default function DeckCardGrid({
  cards,
}: DeckCardGridProps) {
  if (cards.length === 0) {
    return null;
  }

  const sortedCards = sortDeckCards(cards);

  return (
    <div
      className="
        grid
        grid-cols-[repeat(5,minmax(0,72px))]
        justify-center
        gap-2.5
        sm:gap-3
      "
    >
      {sortedCards.map((deckCard) =>
        Array.from(
          {
            length: Math.max(
              deckCard.quantity,
              1
            ),
          },
          (_, copyIndex) => (
            <DeckCardItem
              key={`${deckCard.id}-${copyIndex}`}
              card={deckCard.card}
              compact
            />
          )
        )
      )}
    </div>
  );
}
