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

  /**
   * Desactiva el prefetch de las rutas de detalle. El
   * buscador global lo usa dentro del modal.
   */
  prefetch?: boolean;

  /**
   * Callback previo a la navegación de una carta.
   */
  onNavigate?: () => void;
}

export default function CatalogGrid({
  cards,
  gridClassName = "grid-cols-5 gap-2",
  prefetch,
  onNavigate,
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
          prefetch={prefetch}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}
