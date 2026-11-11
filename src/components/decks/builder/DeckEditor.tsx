"use client";

import { useState } from "react";

import CardSearch from "./CardSearch";

import DeckSection from "../DeckSection";

interface DeckCardItem {
id: number;

name: string;

image: string;

quantity: number;
}

type CardSearchResult = {
id: number;

name: string;

image: string | null;
};

export default function DeckEditor() {
const [mainDeck, setMainDeck] =
useState<DeckCardItem[]>([]);

const [extraDeck] =
useState<DeckCardItem[]>([]);

function addCard(
card: CardSearchResult
) {
const exists = mainDeck.find(
(item) =>
item.id === card.id
);


if (exists) {
  setMainDeck(
    mainDeck.map((item) =>
      item.id === card.id
        ? {
            ...item,

            quantity:
              item.quantity + 1,
          }
        : item
    )
  );

  return;
}

setMainDeck([
  ...mainDeck,

  {
    id: card.id,

    name: card.name,

    image:
      card.image ??
      "/cards/default.jpg",

    quantity: 1,
  },
]);


}

return ( <div
   className="
     space-y-6
   "
 > <CardSearch
     onAdd={addCard}
   />

  <div
    className="
      grid
      gap-5
      lg:grid-cols-2
    "
  >
    <div>
      <DeckSection
        title={`MAIN DECK (${mainDeck.reduce(
          (total, card) =>
            total +
            card.quantity,
          0
        )})`}
        cards={mainDeck.map(
          (card) => ({
            id:
              String(
                card.id
              ),

            quantity:
              card.quantity,

            zone:
              "main",

            card,
          })
        )}
      />
    </div>

    <div>
      <DeckSection
        title={`EXTRA DECK (${extraDeck.length})`}
        cards={extraDeck.map(
          (card) => ({
            id:
              String(
                card.id
              ),

            quantity:
              card.quantity,

            zone:
              "extra",

            card,
          })
        )}
      />
    </div>
  </div>

  <div
    className="
      rounded-xl
      border
      border-zinc-700
      bg-zinc-900
      p-5
    "
  >
    <h3
      className="
        mb-3
        font-bold
      "
    >
      Resumen
    </h3>

    <p>
      Main:{" "}

      {mainDeck.reduce(
        (total, card) =>
          total +
          card.quantity,
        0
      )}

      {" "}cartas
    </p>

    <p>
      Extra:{" "}

      {extraDeck.length}
    </p>
  </div>
</div>


);
}
