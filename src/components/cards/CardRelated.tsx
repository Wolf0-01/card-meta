import CardGrid from "./CardGrid";

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
      <CardGrid
        title={title}
        cards={cards}
      />
    </section>
  );
}