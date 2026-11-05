import CardItem from "@/components/cards/CardItem";

import type {
  CardPreviewData,
} from "@/types/CardPreviewData";

interface CardGridProps {
  title?: string;

  cards: CardPreviewData[];

  showCount?: boolean;

  selectedCardId?: number;

  onCardClick?: (
    card: CardPreviewData
  ) => void;
}

export default function CardGrid({
  title,
  cards,
  showCount = true,
  selectedCardId,
  onCardClick,
}: CardGridProps) {
  return (
    <section className="space-y-6">
      {(title || showCount) && (
        <div
          className="
            flex
            items-center
            justify-between
          "
        >
          {title && (
            <h2
              className="
                text-2xl
                font-bold
                text-foreground
              "
            >
              {title}
            </h2>
          )}

          {showCount && (
            <span
              className="
                rounded-full
                bg-surface
                px-3
                py-1
                text-sm
                text-foreground-secondary
              "
            >
              {cards.length} cartas
            </span>
          )}
        </div>
      )}

      <div
        className="
          grid
          grid-cols-[repeat(auto-fill,minmax(115px,115px))]
          justify-center
          gap-3
        "
      >
        {cards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            selected={
              selectedCardId === card.id
            }
            onClick={onCardClick}
          />
        ))}
      </div>
    </section>
  );
}