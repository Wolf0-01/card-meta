"use client";

import DeckCardGrid from "./DeckCardGrid";

import type {
MetaDeck,
} from "@/types/meta";

interface Props {
deck: MetaDeck;
}

export default function DeckExtraDeck({
deck,
}: Props) {
const extraDeck = deck.cards.filter(
(deckCard) =>
deckCard.zone === "extra"
);

if (extraDeck.length === 0) {
return null;
}

return (
<DeckCardGrid
title={`Extra Deck (${extraDeck.length})`}
cards={
extraDeck.map(
(deckCard) =>
deckCard.card
)
}
/>
);
}
