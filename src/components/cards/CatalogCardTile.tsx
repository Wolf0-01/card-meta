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

import CardHoverTooltip, {
  type TooltipAnchor,
} from "./CardHoverTooltip";

import {
  normalizeRarity,
  RARITY_STYLES,
} from "./cardRarity";

interface CatalogCardTileProps {
  card: CardPreviewData;

  priority?: boolean;

  /**
   * Permite desactivar el prefetch de la ruta de detalle.
   * El buscador global lo usa para no lanzar decenas de
   * peticiones al abrir el modal.
   */
  prefetch?: boolean;

  /**
   * Se ejecuta antes de navegar al detalle de la carta.
   * El buscador global lo usa para cerrar el modal.
   */
  onNavigate?: () => void;
}

function getLevelLabel(
  card: CardPreviewData
) {
  if (card.linkRating) {
    return `L${card.linkRating}`;
  }

  if (card.level) {
    return `★${card.level}`;
  }

  return null;
}

export default function CatalogCardTile({
  card,
  priority = false,
  prefetch,
  onNavigate,
}: CatalogCardTileProps) {
  const [failed, setFailed] =
    useState(false);

  const [anchor, setAnchor] =
    useState<TooltipAnchor | null>(null);

  const linkRef =
    useRef<HTMLAnchorElement>(null);

  const rarity = normalizeRarity(card.rarity);

  const rarityStyle = RARITY_STYLES[rarity];

  const levelLabel = getLevelLabel(card);

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
        prefetch={prefetch}
        onNavigate={onNavigate}
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
            sizes="(max-width: 540px) 20vw, 100px"
            priority={priority}
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

          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              bottom-0
              h-10
              bg-gradient-to-t
              from-black/60
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

          {levelLabel && (
            <span
              className="
                absolute
                right-1
                bottom-1.5
                rounded
                bg-black/80
                px-1
                py-0.5
                text-[8px]
                font-black
                leading-none
                text-amber-300
                shadow
              "
            >
              {levelLabel}
            </span>
          )}
        </div>

        <span
          className={`
            absolute
            -top-2.5
            right-0
            z-20
            rounded-t-md
            px-1.5
            py-0.5
            text-[8px]
            font-black
            leading-none
            tracking-[0.08em]
            ring-1
            ring-white/25
            ${rarityStyle.badge}
          `}
        >
          {rarity}
        </span>
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
