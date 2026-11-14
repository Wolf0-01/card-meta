import RelatedCardTile from "./RelatedCardTile";

import type { CardPreviewData } from "@/types/CardPreviewData";

interface CardRelatedProps {
  title?: string;

  cards: CardPreviewData[];

  className?: string;
}

export default function CardRelated({
  title = "Related Cards",
  cards,
  className = "",
}: CardRelatedProps) {
  if (cards.length === 0) {
    return null;
  }

  return (
    <section
      className={`
        rounded-2xl
        border
        border-slate-700/60
        bg-[#0B132B]
        p-5
        sm:p-6
        ${className}
      `}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
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
            rounded-full
            bg-[#070D1F]
            px-3
            py-1
            text-xs
            font-bold
            text-slate-400
          "
        >
          {cards.length} cards
        </span>
      </div>

      <div
        className="
          grid
          grid-cols-[repeat(auto-fill,minmax(115px,115px))]
          justify-center
          gap-3
        "
      >
        {cards.map((card) => (
          <RelatedCardTile
            key={card.id}
            card={card}
          />
        ))}
      </div>
    </section>
  );
}
