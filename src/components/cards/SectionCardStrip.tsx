import type { CardPreviewData } from "@/types/CardPreviewData";

import RelatedCardTile from "./RelatedCardTile";

interface SectionCardStripProps {
  cards: CardPreviewData[];
}

/**
 * Tira compacta de cartas etiquetadas dentro de una sección
 * de Noticias o Guías. Cada miniatura conserva su rareza,
 * banlist, enlace al detalle y tooltip.
 */
export default function SectionCardStrip({
  cards,
}: SectionCardStripProps) {
  if (cards.length === 0) {
    return null;
  }

  return (
    <div
      aria-label="Cards mentioned in this section"
      className="
        flex
        flex-wrap
        items-start
        gap-2
        border-t
        border-slate-800/80
        pt-2.5
      "
    >
      {cards.map((card) => (
        <div
          key={card.id}
          className="w-[64px] shrink-0 sm:w-[72px]"
        >
          <RelatedCardTile
            card={card}
            showBanlist
          />
        </div>
      ))}
    </div>
  );
}
