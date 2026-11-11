"use client";

import DeckCardItem from "./DeckCardItem";

import type { DeckCard } from "@/types/deck";

interface DeckCardGridProps {
  title: string;

  cards: DeckCard[];
}

export default function DeckCardGrid({
  title,
  cards,
}: DeckCardGridProps) {
  if (cards.length === 0) {
    return null;
  }

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2
          className="
            text-[11px]
            font-black
            uppercase
            tracking-[0.16em]
            text-foreground-muted
          "
        >
          {title}
        </h2>
      </div>

      <div
        className="
          grid
          grid-cols-[repeat(5,minmax(0,72px))]
          justify-center
          gap-1.5
        "
      >
        {cards.map((deckCard) => (
          <DeckCardItem
            key={deckCard.id}
            card={deckCard.card}
            quantity={deckCard.quantity}
          />
        ))}
      </div>
    </section>
  );
}
