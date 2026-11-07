import type {
  CardPreviewData,
} from "@/types/CardPreviewData";

import CatalogCardTile from "./CatalogCardTile";

interface CatalogGridProps {
  cards: CardPreviewData[];
}

export default function CatalogGrid({
  cards,
}: CatalogGridProps) {
  return (
    <div
      className="
        grid
        grid-cols-[repeat(auto-fill,minmax(94px,1fr))]
        justify-items-center
        gap-1.5
        sm:gap-2
      "
    >
      {cards.map((card, index) => (
        <CatalogCardTile
          key={card.id}
          card={card}
          priority={index < 10}
        />
      ))}
    </div>
  );
}
