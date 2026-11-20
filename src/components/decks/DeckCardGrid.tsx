"use client";

import DeckCardItem from "./DeckCardItem";

import { sortDeckCards } from "@/lib/decks/rarityOrder";

import type { DeckCard } from "@/types/deck";

interface DeckCardGridProps {
  cards: DeckCard[];
}

/**
 * Cuadrícula continua de 5 columnas al estilo de Duel Links
 * Meta. Cada copia se expande como una miniatura propia, de
 * modo que un mazo con 3 copias muestra 3 cartas seguidas.
 */
export default function DeckCardGrid({
  cards,
}: DeckCardGridProps) {
  if (cards.length === 0) {
    return null;
  }

  /*
   * El orden jerárquico de Duel Links Meta se aplica
   * sobre las cartas agrupadas (para conocer si tienen
   * 3x, 2x o 1x copia) y solo después se expanden las
   * copias individuales.
   */
  const sortedCards = sortDeckCards(cards);

  return (
    <div
      className="
        grid
        grid-cols-[repeat(5,minmax(0,72px))]
        justify-center
        gap-x-1.5
        gap-y-2.5
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
