"use client";

import DeckCardGrid from "./DeckCardGrid";

import type {
MetaDeck,
} from "@/types/meta";

interface Props {
deck: MetaDeck;
}

export default function DeckMainDeck({
deck,
}: Props) {
const mainDeck = deck.cards.filter(
(deckCard) =>
deckCard.zone === "main"
);

const monsters = mainDeck.filter(
(deckCard) =>
deckCard.card.type
.toLowerCase()
.includes("monster")
);

const spells = mainDeck.filter(
(deckCard) =>
deckCard.card.type
.toLowerCase()
.includes("spell")
);

const traps = mainDeck.filter(
(deckCard) =>
deckCard.card.type
.toLowerCase()
.includes("trap")
);

return ( <section
   className="
     space-y-10
   "
 >
{monsters.length > 0 && (
<DeckCardGrid
title={`Monsters (${monsters.length})`}
cards={monsters.map(
(deckCard) => deckCard.card
)}
/>
)}


  {spells.length > 0 && (
    <DeckCardGrid
      title={`Spells (${spells.length})`}
      cards={spells.map(
        (deckCard) => deckCard.card
      )}
    />
  )}

  {traps.length > 0 && (
    <DeckCardGrid
      title={`Traps (${traps.length})`}
      cards={traps.map(
        (deckCard) => deckCard.card
      )}
    />
  )}
</section>


);
}
