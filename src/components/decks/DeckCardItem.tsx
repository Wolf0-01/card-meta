"use client";

import Image from "next/image";

import DeckCardBadges from "./DeckCardBadges";

import { DeckCardInfo } from "@/types/deck";

interface DeckCardItemProps {
  card: DeckCardInfo;

  quantity?: number;

  onClick?: () => void;
}

export default function DeckCardItem({
  card,
  quantity = 1,
  onClick,
}: DeckCardItemProps) {
  const level =
    card.level ??
    card.linkRating ??
    0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        relative
        overflow-hidden
        rounded-xl
        border
        border-zinc-800
        bg-zinc-900
        transition-all
        duration-200
        hover:scale-[1.03]
        hover:border-blue-500
        hover:shadow-lg
        hover:shadow-blue-500/20
      "
    >
      <div
        className="
          relative
          aspect-[421/614]
          w-full
        "
      >
        <Image
          src={
            card.image ??
            "/images/cards/card-placeholder.webp"
          }
          alt={card.name}
          fill
          className="
            object-cover
            transition-transform
            duration-200
            group-hover:scale-105
          "
        />

        <DeckCardBadges
          card={card}
        />
      </div>

      {quantity > 1 && (
        <div
          className="
            absolute
            right-2
            top-2
            rounded-lg
            bg-black/80
            px-2
            py-1
            text-sm
            font-bold
            text-white
          "
        >
          ×{quantity}
        </div>
      )}

      <div
        className="
          space-y-2
          p-3
        "
      >
        <h3
          className="
            truncate
            text-sm
            font-bold
            text-white
          "
        >
          {card.name}
        </h3>

        <div
          className="
            flex
            items-center
            justify-between
            text-xs
            text-zinc-400
          "
        >
          <span>
            {card.attribute ?? "-"}
          </span>

          <span>
            {card.race ?? card.type}
          </span>
        </div>

        {level > 0 && (
          <div
            className="
              truncate
              text-xs
              text-amber-400
            "
          >
            {"★".repeat(
              Math.min(level, 12)
            )}
          </div>
        )}

        {(card.attack !== null ||
          card.defense !== null) && (
          <div
            className="
              flex
              justify-between
              text-xs
              font-semibold
              text-zinc-300
            "
          >
            <span>
              ATK {card.attack ?? "-"}
            </span>

            <span>
              DEF {card.defense ?? "-"}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}