"use client";

import CardItem from "./CardItem";

import type { CardPreviewData } from "@/types/CardPreviewData";

interface CardCatalogProps {
  cards: CardPreviewData[];

  onSelectCard: (
    card: CardPreviewData
  ) => void;
}

export default function CardCatalog({
  cards,
  onSelectCard,
}: CardCatalogProps) {
  return (
    <div
      className="
        grid
        grid-cols-2
        gap-4
        justify-items-center
        sm:grid-cols-3
        md:grid-cols-4
        lg:grid-cols-5
        xl:grid-cols-6
      "
    >
      {cards
        .filter(Boolean)
        .map((card) => (
          <CardItem
            key={card.id}
            card={card}
            onClick={onSelectCard}
          />
        ))}
    </div>
  );
}