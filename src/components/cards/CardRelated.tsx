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
        border-zinc-800
        bg-zinc-900
        p-6
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