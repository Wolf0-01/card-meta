"use client";

import {
useState,
} from "react";

import {
useRouter,
} from "next/navigation";

import CardBrowser from "@/components/cards/CardBrowser";

import type {
CardPreviewData,
} from "@/types/CardPreviewData";

import type {
BuilderDeck,
BuilderDeckStats,
DeckZone,
} from "@/types/deck-builder";

import DeckBuilderHeader from "./DeckBuilderHeader";
import DeckBuilderToolbar from "./DeckBuilderToolbar";
import DeckZones from "./DeckZones/DeckZones";

interface DeckBuilderProps {
deck: BuilderDeck;

stats: BuilderDeckStats;

availableCards: CardPreviewData[];

addCard: (
card: CardPreviewData
) => void;

removeCard: (
cardId: number,
zone: DeckZone
) => void;

moveCard: (
cardId: number,
from: DeckZone,
to: DeckZone
) => void;

setQuantity: (
cardId: number,
zone: DeckZone,
quantity: number
) => void;

clearDeck: () => void;
}

export default function DeckBuilder({
deck,
stats,
availableCards,
addCard,
removeCard,
moveCard,
setQuantity,
clearDeck,
}: DeckBuilderProps) {
const router = useRouter();

const [
deckName,
setDeckName,
] = useState(deck.name);

const [
isSaving,
setIsSaving,
] = useState(false);

const [
saveMessage,
setSaveMessage,
] = useState<string | null>(null);

async function saveDeck() {
  const name = deckName.trim();

  if (!name) {
    setSaveMessage("Give the deck a name.");
    return;
  }

  if (deck.cards.length === 0) {
    setSaveMessage("Add at least one card before publishing.");
    return;
  }

  setIsSaving(true);
  setSaveMessage(null);

  try {
    const response = await fetch(
      "/api/decks",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,

          cards: deck.cards.map(
            (card) => ({
              id: card.card.id,

              quantity: card.quantity,

              zone: card.zone,
            })
          ),
        }),
      }
    );

    const data = (await response
      .json()
      .catch(() => null)) as {
      slug?: string;
      identifier?: string;
      error?: string;
    } | null;

    if (!response.ok) {
      throw new Error(
        data?.error ??
          "Could not save the deck."
      );
    }

    setSaveMessage(
      "Deck published successfully."
    );

    if (
      data?.slug &&
      data?.identifier
    ) {
      router.push(
        `/decks/${data.slug}/${data.identifier}`
      );
    }
  } catch (error) {
    setSaveMessage(
      error instanceof Error
        ? error.message
        : "Could not save the deck."
    );
  } finally {
    setIsSaving(false);
  }
}

return ( <section className="space-y-6"> <DeckBuilderHeader
     deck={{
       ...deck,
       name: deckName,
     }}
     stats={stats}
     onDeckNameChange={setDeckName}
     onSave={saveDeck}
     isSaving={isSaving}
     saveMessage={saveMessage}
   />


  <DeckBuilderToolbar
    onClear={clearDeck}
  />

  <div
    className="
      grid
      gap-6
      xl:grid-cols-[2fr_1fr]
    "
  >
    <DeckZones
      cards={deck.cards}
      onRemoveCard={removeCard}
      onMoveCard={moveCard}
      onSetQuantity={setQuantity}
    />

    <CardBrowser
      cards={availableCards}
      onAddCard={addCard}
    />
  </div>
</section>


);
}
