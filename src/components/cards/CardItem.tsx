"use client";

import CardPreview from "./CardPreview";
import CardBadge from "./CardBadge";
import BanlistBadge from "./BanlistBadge";

import type {
  CardPreviewData,
} from "@/types/CardPreviewData";

interface CardItemProps {
  card: CardPreviewData;

  quantity?: number;

  selected?: boolean;

  className?: string;

  onClick?: (
    card: CardPreviewData
  ) => void;
}

export default function CardItem({
  card,
  quantity,
  selected = false,
  className = "",
  onClick,
}: CardItemProps) {
  const cardType =
    card.type?.toLowerCase() ?? "";

  const isMonster =
    cardType.includes("monster");

  const isSpell =
    cardType.includes("spell");

  const isTrap =
    cardType.includes("trap");

  return (
    <button
      type="button"
      aria-label={card.name}
      onClick={() =>
        onClick?.(card)
      }
      className={`
        group
        relative
        w-[115px]
        overflow-hidden
        rounded-xl
        border
        bg-zinc-900
        text-left
        transition-all
        duration-200

        ${
          selected
            ? `
              border-blue-500
              ring-2
              ring-blue-500/30
            `
            : `
              border-zinc-700
              hover:-translate-y-1
              hover:border-blue-500
              hover:shadow-lg
              hover:shadow-blue-500/20
            `
        }

        ${className}
      `}
    >
      <div className="relative">
        <CardPreview
          image={card.image}
          name={card.name}
        />

        <div
          className="
            absolute
            left-0.5
            top-0.5
            z-10
            flex
            flex-wrap
            gap-1
          "
        >
          <BanlistBadge
            status={card.banlistStatus}
            size="sm"
          />

          {card.rarity && (
            <CardBadge
              variant="rarity"
            >
              {card.rarity}
            </CardBadge>
          )}

          {isMonster && (
            <CardBadge
              variant="monster"
            >
              Monster
            </CardBadge>
          )}

          {isSpell && (
            <CardBadge
              variant="spell"
            >
              Spell
            </CardBadge>
          )}

          {isTrap && (
            <CardBadge
              variant="trap"
            >
              Trap
            </CardBadge>
          )}
        </div>

        {quantity !== undefined &&
          quantity > 1 && (
            <div
              className="
                absolute
                bottom-2
                right-2
                z-10
                rounded-md
                bg-black/80
                px-2
                py-1
                text-xs
                font-bold
                text-white
                backdrop-blur-sm
              "
            >
              ×{quantity}
            </div>
          )}
      </div>

      <div
        className="
          space-y-1
          p-2
        "
      >
        <h3
          className="
            truncate
            text-center
            text-xs
            font-bold
            text-white
          "
          title={card.name}
        >
          {card.name}
        </h3>

        <p
          className="
            truncate
            text-center
            text-[10px]
            text-zinc-400
          "
        >
          {card.archetype ??
            card.race ??
            card.type}
        </p>
      </div>
    </button>
  );
}