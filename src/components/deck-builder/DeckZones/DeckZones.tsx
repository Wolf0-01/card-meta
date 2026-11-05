"use client";

import { useMemo } from "react";

import type {
BuilderCard,
DeckZone as DeckZoneType,
} from "@/types/deck-builder";

import DeckZone from "./DeckZone";

interface DeckZonesProps {
cards: BuilderCard[];

onRemoveCard: (
cardId: number,
zone: DeckZoneType
) => void;

onMoveCard: (
cardId: number,
from: DeckZoneType,
to: DeckZoneType
) => void;

onSetQuantity: (
cardId: number,
zone: DeckZoneType,
quantity: number
) => void;
}

const DECK_LIMITS = {
main: 30,
extra: 9,
side: 10,
} as const;

export default function DeckZones({
cards,
onRemoveCard,
onMoveCard,
onSetQuantity,
}: DeckZonesProps) {
const {
mainDeck,
extraDeck,
sideDeck,
mainCount,
extraCount,
sideCount,
} = useMemo(() => {
const mainDeck = cards.filter(
(card) => card.zone === "main"
);


const extraDeck = cards.filter(
  (card) => card.zone === "extra"
);

const sideDeck = cards.filter(
  (card) => card.zone === "side"
);

return {
  mainDeck,
  extraDeck,
  sideDeck,

  mainCount: mainDeck.reduce(
    (sum, card) =>
      sum + card.quantity,
    0
  ),

  extraCount: extraDeck.reduce(
    (sum, card) =>
      sum + card.quantity,
    0
  ),

  sideCount: sideDeck.reduce(
    (sum, card) =>
      sum + card.quantity,
    0
  ),
};


}, [cards]);

return ( <div className="space-y-8">
<DeckZone
title={
`Main Deck (${mainCount}/${DECK_LIMITS.main})`
}
cards={mainDeck}
maxCards={DECK_LIMITS.main}
zone="main"
onRemoveCard={onRemoveCard}
onMoveCard={onMoveCard}
onSetQuantity={onSetQuantity}
/>

  <DeckZone
    title={
      `Extra Deck (${extraCount}/${DECK_LIMITS.extra})`
    }
    cards={extraDeck}
    maxCards={DECK_LIMITS.extra}
    zone="extra"
    onRemoveCard={onRemoveCard}
    onMoveCard={onMoveCard}
    onSetQuantity={onSetQuantity}
  />

  <DeckZone
    title={
      `Side Deck (${sideCount}/${DECK_LIMITS.side})`
    }
    cards={sideDeck}
    maxCards={DECK_LIMITS.side}
    zone="side"
    onRemoveCard={onRemoveCard}
    onMoveCard={onMoveCard}
    onSetQuantity={onSetQuantity}
  />
</div>


);
}
