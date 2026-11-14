import Link from "next/link";

export default function TierListLinkCard() {
return ( <Link
   href="/tier-list"
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
 > <h2
     className="
       text-2xl
       font-bold
       text-white
     "
   >
⚔️ Tier List </h2>

  <p
    className="
      mt-3
      text-zinc-400
    "
  >
    Check the competitive decks
    organized by tier.
  </p>

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
    View Tier List
  </div>
</Link>


);
}
