"use client";

import {
useSyncExternalStore,
} from "react";

import useDeckBuilder from "@/hooks/useDeckBuilder";

import DeckBuilder from "./DeckBuilder";

import type {
Card,
} from "@/types/card";

import type {
BuilderDeck,
} from "@/types/deck-builder";

interface Props {
availableCards?: Card[];
}

const subscribeToHydration = () => () => {};

function useIsMounted() {
return useSyncExternalStore(
subscribeToHydration,
() => true,
() => false
);
}

export default function
DeckBuilderContainer({
availableCards = [],
}: Props) {
const isMounted = useIsMounted();

const {
cards,
stats,
addCard,
removeCard,
moveCard,
setQuantity,
clearDeck,
} = useDeckBuilder();

if (!isMounted) {
return ( <section
     className="
       space-y-6
     "
   > <div
       className="
         rounded-xl
         border
         border-zinc-800
         bg-zinc-950
         p-6
         text-zinc-400
       "
     >
Cargando constructor... </div> </section>
);
}

const deck:
BuilderDeck = {
name:
"New Deck",


  description:
    "",

  archetype:
    "",

  skill:
    "",

  format:
    "Speed Duel",

  cards,
};


return (
<DeckBuilder
deck={deck}
stats={stats}
availableCards={
availableCards
}
addCard={
addCard
}
removeCard={
removeCard
}
moveCard={
moveCard
}
setQuantity={
setQuantity
}
clearDeck={
clearDeck
}
/>
);
}
