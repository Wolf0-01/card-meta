import Link from "next/link";

import type {
TierDeck,
} from "@/components/home/TierListSection";

interface TierListCardProps {
deck: TierDeck;
}

export default function TierListCard({
deck,
}: TierListCardProps) {
return (
<Link
href={`/decks/${deck.slug}`}
className="
group
block
rounded-xl
border
border-zinc-800
bg-zinc-900
p-6
transition
hover:-translate-y-1
hover:border-blue-500
hover:shadow-lg
hover:shadow-blue-500/10
"
> <div
     className="
       flex
       items-start
       justify-between
       gap-4
     "
   > <div> <h2
         className="
           text-xl
           font-bold
           text-white
         "
       >
{deck.name} </h2>


      {deck.archetype && (
        <p
          className="
            mt-2
            text-sm
            text-zinc-400
          "
        >
          {deck.archetype}
        </p>
      )}
    </div>

    <span
      className="
        shrink-0
        rounded-full
        bg-blue-500/10
        px-3
        py-1
        text-sm
        font-bold
        text-blue-400
      "
    >
      {deck.tier}
    </span>
  </div>

  <div
    className="
      mt-5
      inline-flex
      rounded-lg
      bg-blue-600
      px-5
      py-2
      font-bold
      text-white
      transition
      group-hover:bg-blue-500
    "
  >
    View deck
  </div>
</Link>


);
}
