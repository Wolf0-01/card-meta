"use client";

import DeckCardItem from "./DeckCardItem";

import { sortCardsByRarity } from "@/lib/decks/rarityOrder";

import type { MetaDeck } from "@/types/meta";

interface Props {
  deck: MetaDeck;
}

export default function DeckExtraDeck({
  deck,
}: Props) {
  const extraDeck = (deck.cards ?? []).filter(
    (deckCard) =>
      deckCard.zone === "extra"
  );

  if (extraDeck.length === 0) {
    return null;
  }

  const total = extraDeck.reduce(
    (count, deckCard) =>
      count + (deckCard.quantity ?? 1),
    0
  );

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
          Extra Deck ({total})
        </h2>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {sortCardsByRarity(extraDeck).map(
          (deckCard) => (
            <DeckCardItem
              key={deckCard.id}
              card={deckCard.card}
              quantity={deckCard.quantity}
              compact
            />
          )
        )}
      </div>
    </section>
  );
}
