"use client";

import Link from "next/link";

import type {
DeckPreview,
} from "@/types/deck-preview";

interface Props {
deck: DeckPreview;
}

export default function DeckCardPreview({
deck,
}: Props) {
return (
<Link
href={`/decks/${deck.slug}/${deck.identifier}`}
className="
block
rounded-xl
border
border-zinc-700
bg-zinc-900
p-4
transition
hover:border-blue-500
"
> <div
     className="
       flex
       items-start
       justify-between
     "
   > <div> <h3
         className="
           text-lg
           font-bold
           text-white
         "
       >
{deck.name} </h3>


      <p
        className="
          mt-1
          text-sm
          text-zinc-400
        "
      >
        {deck.archetype?.name ??
          "Unknown Archetype"}
      </p>
    </div>

    <span
      className="
        rounded-full
        bg-red-500/20
        px-3
        py-1
        text-sm
        font-bold
        text-red-400
      "
    >
      🔥 {deck.tier ?? "Rogue"}
    </span>
  </div>

  <div
    className="
      mt-5
      grid
      grid-cols-3
      gap-3
      text-center
    "
  >
    <div
      className="
        rounded-lg
        bg-zinc-950
        p-2
      "
    >
      <p className="text-xs text-zinc-500">
        WIN RATE
      </p>

      <p className="font-bold">
        {deck.winRate}%
      </p>
    </div>

    <div
      className="
        rounded-lg
        bg-zinc-950
        p-2
      "
    >
      <p className="text-xs text-zinc-500">
        META
      </p>

      <p className="font-bold">
        {deck.popularity}%
      </p>
    </div>

    <div
      className="
        rounded-lg
        bg-zinc-950
        p-2
      "
    >
      <p className="text-xs text-zinc-500">
        CARDS
      </p>

      <p className="font-bold">
        {deck.totalCards}
      </p>
    </div>
  </div>
</Link>


);
}
