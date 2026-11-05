"use client";

import DeckCardItem from "./DeckCardItem";

import { DeckCardInfo } from "@/types/deck";

interface DeckCardGridProps {
  title: string;

  cards: DeckCardInfo[];
}

export default function DeckCardGrid({
  title,
  cards,
}: DeckCardGridProps) {
  if (cards.length === 0) {
    return null;
  }

  return (
    <section
      className="
        space-y-5
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
        "
      >
        <h2
          className="
            text-2xl
            font-bold
            text-white
          "
        >
          {title}
        </h2>

        <span
          className="
            rounded-lg
            bg-zinc-900
            px-3
            py-1
            text-sm
            text-zinc-400
          "
        >
          {cards.length} cards
        </span>
      </div>

      <div
        className="
          grid
          grid-cols-2
          gap-4
          sm:grid-cols-3
          md:grid-cols-4
          lg:grid-cols-5
          xl:grid-cols-6
        "
      >
        {cards.map((card) => (
          <DeckCardItem
            key={card.id}
            card={card}
          />
        ))}
      </div>
    </section>
  );
}