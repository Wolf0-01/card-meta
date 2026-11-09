"use client";

import DeckCardGrid from "./DeckCardGrid";

import type { DeckCard } from "@/types/deck";

import type { MetaDeck } from "@/types/meta";

interface Props {
  deck: MetaDeck;
}

function countCopies(cards: DeckCard[]) {
  return cards.reduce(
    (total, card) =>
      total + (card.quantity ?? 1),
    0
  );
}

function hasType(
  deckCard: DeckCard,
  type: string
) {
  return deckCard.card.type
    .toLowerCase()
    .includes(type);
}

export default function DeckMainDeck({
  deck,
}: Props) {
  const mainDeck = (deck.cards ?? []).filter(
    (deckCard) =>
      deckCard.zone === "main"
  );

  const monsters = mainDeck.filter(
    (deckCard) =>
      hasType(deckCard, "monster")
  );

  const spells = mainDeck.filter(
    (deckCard) =>
      hasType(deckCard, "spell")
  );

  const traps = mainDeck.filter(
    (deckCard) =>
      hasType(deckCard, "trap")
  );

  const others = mainDeck.filter(
    (deckCard) =>
      !hasType(deckCard, "monster") &&
      !hasType(deckCard, "spell") &&
      !hasType(deckCard, "trap")
  );

  const groups = [
    {
      key: "monsters",
      label: "Monsters",
      cards: monsters,
    },
    {
      key: "spells",
      label: "Spells",
      cards: spells,
    },
    {
      key: "traps",
      label: "Traps",
      cards: traps,
    },
    {
      key: "other",
      label: "Other",
      cards: others,
    },
  ];

  return (
    <section className="space-y-4">
      {groups
        .filter(
          (group) => group.cards.length > 0
        )
        .map((group) => (
          <DeckCardGrid
            key={group.key}
            title={`${group.label} (${countCopies(
              group.cards
            )})`}
            cards={group.cards}
          />
        ))}
    </section>
  );
}
