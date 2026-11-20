"use client";

import DeckCardGrid from "./DeckCardGrid";

import type { MetaDeck } from "@/types/meta";

interface Props {
  deck: MetaDeck;
}

/**
 * Extra Deck separado del Main Deck únicamente por una línea
 * sutil, sin encabezados ni divisores internos.
 */
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

  return (
    <section className="mt-4 border-t border-border/70 pt-3">
      <DeckCardGrid
        cards={extraDeck}
      />
    </section>
  );
}
