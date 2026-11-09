"use client";

import Image from "next/image";

import DeckCardBadges from "./DeckCardBadges";

import { DeckCardInfo } from "@/types/deck";

interface DeckCardItemProps {
  card: DeckCardInfo;

  quantity?: number;

  onClick?: () => void;

  compact?: boolean;

  className?: string;
}

export default function DeckCardItem({
  card,
  quantity = 1,
  onClick,
  compact = false,
  className = "",
}: DeckCardItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${card.name}${
        quantity > 1 ? ` · x${quantity}` : ""
      }`}
      className={`
        group
        relative
        block
        shrink-0
        overflow-hidden
        rounded-lg
        border
        border-border
        bg-surface
        transition-all
        duration-200
        hover:z-10
        hover:scale-[1.03]
        hover:border-primary
        hover:shadow-lg
        hover:shadow-primary/20
        ${compact ? "w-[76px]" : "w-full"}
        ${className}
      `}
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
          sizes={
            compact
              ? "80px"
              : "(max-width: 768px) 18vw, 160px"
          }
          className="
            object-cover
            transition-transform
            duration-200
            group-hover:scale-105
          "
        />

        {!compact && (
          <DeckCardBadges card={card} />
        )}

        {quantity > 1 && (
          <span
            className={`
              absolute
              right-1
              top-1
              rounded-md
              bg-black/85
              font-black
              leading-none
              text-white
              shadow
              ${
                compact
                  ? "px-1 py-0.5 text-[9px]"
                  : "px-1.5 py-1 text-[11px]"
              }
            `}
          >
            ×{quantity}
          </span>
        )}
      </div>
    </button>
  );
}
