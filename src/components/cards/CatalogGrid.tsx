import type {
  CardPreviewData,
} from "@/types/CardPreviewData";

import CatalogCardTile from "./CatalogCardTile";

interface CatalogGridProps {
  cards: CardPreviewData[];

  /**
   * Clases opcionales para controlar la densidad de la
   * cuadrícula. Por defecto replica el catálogo compacto.
   */
  gridClassName?: string;
}

export default function CatalogGrid({
  cards,
  gridClassName = "grid-cols-5 gap-2",
}: CatalogGridProps) {
  return (
    <div
      className={`
        grid
        ${gridClassName}
      `}
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
