"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import type {
  CardPreviewData,
} from "@/types/CardPreviewData";

import BanlistBadge from "./BanlistBadge";

import CardHoverTooltip, {
  type TooltipAnchor,
} from "./CardHoverTooltip";

import RarityBadge from "./RarityBadge";

import {
  normalizeRarity,
  RARITY_STYLES,
} from "./cardRarity";

interface RelatedCardTileProps {
  card: CardPreviewData;

  /**
   * Muestra el círculo de la banlist sobre la miniatura.
   * Se activa en las tiras de cartas de artículos y guías.
   */
  showBanlist?: boolean;
}

/**
 * Miniatura limpia de una carta relacionada: solo imagen,
 * pestaña de rareza y tooltip. La navegación conserva el
 * scroll para que el detalle y las relacionadas se
 * actualicen en la misma vista.
 */
export default function RelatedCardTile({
  card,
  showBanlist = false,
}: RelatedCardTileProps) {
  const [failed, setFailed] = useState(false);

  const [anchor, setAnchor] =
    useState<TooltipAnchor | null>(null);

  const linkRef =
    useRef<HTMLAnchorElement>(null);

  const rarity = normalizeRarity(card.rarity);

  const rarityStyle = RARITY_STYLES[rarity];

  const imageSrc =
    failed || !card.image
      ? "/cards/default.jpg"
      : card.image;

  function showTooltip() {
    const rect =
      linkRef.current?.getBoundingClientRect();

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
        ref={linkRef}
        href={`/cards/${card.slug}`}
        scroll={false}
        prefetch={false}
        aria-label={card.name}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="
          group
          relative
          block
          w-full
          select-none
        "
      >
        <div
          className="
            relative
            aspect-[59/86]
            overflow-hidden
            rounded-lg
            border
            border-slate-700
            bg-slate-800
            shadow-sm
            ring-1
            ring-inset
            ring-white/5
            transition-all
            duration-150
            group-hover:border-blue-400/80
            group-hover:shadow-[0_0_18px_rgba(59,130,246,0.35)]
          "
        >
          <Image
            src={imageSrc}
            alt={card.name}
            fill
            sizes="115px"
            unoptimized={failed}
            draggable={false}
            onError={() => setFailed(true)}
            className="
              object-cover
              transition-transform
              duration-200
              group-hover:scale-[1.03]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              top-0
              h-8
              bg-gradient-to-b
              from-black/70
              to-transparent
            "
          />

          <span
            aria-hidden
            className={`
              pointer-events-none
              absolute
              inset-x-0
              top-0
              z-10
              h-[3px]
              ${rarityStyle.strip}
              ${rarityStyle.glow}
            `}
          />

          {showBanlist && card.banlistStatus && (
            <span className="pointer-events-none absolute left-1 top-1 z-20 flex">
              <BanlistBadge
                status={card.banlistStatus}
                size="sm"
              />
            </span>
          )}
        </div>

        <RarityBadge
          rarity={rarity}
          size="sm"
          className="absolute -top-2 right-0 z-20"
        />
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
