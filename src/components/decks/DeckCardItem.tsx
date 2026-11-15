"use client";

import Image from "next/image";

import Link from "next/link";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import CardHoverTooltip, {
  type TooltipAnchor,
} from "@/components/cards/CardHoverTooltip";

import {
  normalizeRarity,
  RARITY_STYLES,
} from "@/components/cards/cardRarity";

import { DeckCardInfo } from "@/types/deck";

interface DeckCardItemProps {
  card: DeckCardInfo;

  onClick?: () => void;

  compact?: boolean;

  className?: string;
}

export default function DeckCardItem({
  card,
  onClick,
  compact = false,
  className = "",
}: DeckCardItemProps) {
  const [anchor, setAnchor] =
    useState<TooltipAnchor | null>(null);

  const cardRef =
    useRef<HTMLAnchorElement>(null);

  const rarity = normalizeRarity(card.rarity);

  const rarityStyle = RARITY_STYLES[rarity];

  function showTooltip() {
    const rect =
      cardRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    setAnchor({
      top: rect.top,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    });
  }

  function hideTooltip() {
    setAnchor(null);
  }

  useEffect(() => {
    if (!anchor) {
      return;
    }

    function handleViewportChange() {
      setAnchor(null);
    }

    window.addEventListener(
      "scroll",
      handleViewportChange,
      true
    );

    window.addEventListener(
      "resize",
      handleViewportChange
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleViewportChange,
        true
      );

      window.removeEventListener(
        "resize",
        handleViewportChange
      );
    };
  }, [anchor]);

  return (
    <>
      <Link
        ref={cardRef}
        href={`/cards/${card.slug}`}
        prefetch={false}
        onClick={onClick}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        title={card.name}
        className={`
          group
          relative
          block
          shrink-0
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
          ${compact ? "w-[72px]" : "w-full"}
          ${className}
        `}
      >
        <div
          className="
            relative
            aspect-[59/86]
            w-full
            overflow-hidden
            rounded-lg
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
                ? "72px"
                : "(max-width: 768px) 18vw, 72px"
            }
            className="
              object-cover
              transition-transform
              duration-200
              group-hover:scale-105
            "
          />
        </div>

        {!compact && card.rarity && (
          <span
            className={`
              absolute
              -top-2.5
              right-0
              z-10
              rounded-t-md
              px-1.5
              py-0.5
              text-[8px]
              font-black
              leading-none
              tracking-wide
              ring-1
              ring-white/25
              ${rarityStyle.badge}
            `}
          >
            {rarity}
          </span>
        )}
      </Link>

      {anchor && (
        <CardHoverTooltip
          card={card}
          anchor={anchor}
        />
      )}
    </>
  );
}
