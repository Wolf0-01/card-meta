"use client";

import DeckSection from "@/components/decks/DeckSection";

import type {
ImportedDeckCard,
ImportedDeckResult,
} from "@/types/imported-deck";

interface Props {
deck: ImportedDeckResult;
}

function createSectionCards(
cards: ImportedDeckCard[]
) {
return cards.map((item) => ({
id: `${item.zone}-${item.card.id}`,


quantity: item.quantity,

zone: item.zone,

card: {
  id: item.card.id,

  name: item.card.name,

  image: item.card.image,

  type: item.card.type,
},


}));
}

export default function ImportedDeckViewer({
deck,
}: Props) {
return ( <section className="space-y-6"> <DeckSection
     title="MAIN DECK"
     cards={createSectionCards(deck.main)}
   />


  <DeckSection
    title="EXTRA DECK"
    cards={createSectionCards(deck.extra)}
  />
</section>


);
}
