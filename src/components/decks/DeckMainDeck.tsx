"use client";

import DeckCardGrid from "./DeckCardGrid";

import type { MetaDeck } from "@/types/meta";

interface Props {
  deck: MetaDeck;
}

/**
 * Main Deck en una única cuadrícula continua, sin títulos
 * internos. El orden es Monsters → Spells → Traps, luego
 * subtipo oficial, rareza, copias y nombre (ver
 * `sortDeckCards`).
 */
export default function DeckMainDeck({
  deck,
}: Props) {
  const mainDeck = (deck.cards ?? []).filter(
    (deckCard) =>
      deckCard.zone === "main"
  );

  if (mainDeck.length === 0) {
    return null;
  }

  return (
    <DeckCardGrid
      cards={mainDeck}
    />
  );
}
