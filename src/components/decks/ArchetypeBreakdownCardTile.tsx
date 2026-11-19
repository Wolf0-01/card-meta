"use client";

import Image from "next/image";

import {
  useEffect,
  useState,
} from "react";

import {
  Check,
} from "lucide-react";

import CardHoverTooltip, {
  type TooltipAnchor,
} from "@/components/cards/CardHoverTooltip";

import BanlistBadge from "@/components/cards/BanlistBadge";

import RarityBadge from "@/components/cards/RarityBadge";

import {
  normalizeRarity,
  RARITY_STYLES,
} from "@/components/cards/cardRarity";

import type { DeckCardInfo } from "@/types/deck";

interface ArchetypeBreakdownCardTileProps {
  card: DeckCardInfo;

  /** Cantidad modal entre los mazos del arquetipo. */
  copies: number;

  /** Porcentaje real de inclusión. */
  percentage: number;

  /** Solo ADMIN y EDITOR pueden usar la carta como filtro. */
  interactive: boolean;

  selected: boolean;

  onToggle: () => void;
}

/**
 * Miniatura de carta del DECK BREAKDOWN.
 *
 * Reproduce el estilo de Duel Links Meta: pestaña de rareza,
 * insignia de banlist, tooltip al pasar el mouse y una franja
 * inferior oscura con la cantidad modal y el porcentaje de
 * inclusión (`3x in 100%`).
 */
export default function ArchetypeBreakdownCardTile({
  card,
  copies,
  percentage,
  interactive,
  selected,
  onToggle,
}: ArchetypeBreakdownCardTileProps) {
  const [anchor, setAnchor] =
    useState<TooltipAnchor | null>(null);

  const [element, setElement] =
    useState<HTMLElement | null>(null);

  const rarity = normalizeRarity(card.rarity);

  const rarityStyle = RARITY_STYLES[rarity];

  const inclusion = `${copies}x in ${percentage}%`;

  function showTooltip() {
    const rect =
      element?.getBoundingClientRect();

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

  const content = (
    <>
      <span
        className={`
          relative
          block
          aspect-[59/86]
          overflow-hidden
          rounded-lg
          border
          bg-slate-800
          transition-colors
          ${
            selected
              ? "border-blue-400 ring-2 ring-blue-400/60"
              : interactive
                ? "border-slate-700 group-hover:border-blue-400/80 group-focus-visible:border-blue-400/80"
                : "border-slate-700"
          }
        `}
      >
        {card.image ? (
          <Image
            src={card.image}
            alt={card.name}
            fill
            sizes="(max-width: 640px) 22vw, 96px"
            className={`
              object-cover
              ${
                interactive
                  ? "transition-transform duration-200 group-hover:scale-[1.04]"
                  : ""
              }
            `}
          />
        ) : (
          <span
            aria-hidden
            className="
              flex
              h-full
              w-full
              items-center
              justify-center
              text-[9px]
              font-black
              text-slate-500
            "
          >
            {rarity}
          </span>
        )}

        <span
          aria-hidden
          className={`absolute inset-x-0 top-0 h-[2px] ${rarityStyle.strip}`}
        />

        {card.banlistStatus && (
          <span className="absolute left-0.5 top-1 z-10 flex">
            <BanlistBadge
              status={card.banlistStatus}
              size="sm"
            />
          </span>
        )}

        {selected && (
          <span
            aria-hidden
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              bg-blue-950/45
            "
          >
            <span
              className="
                flex
                h-6
                w-6
                items-center
                justify-center
                rounded-full
                border
                border-blue-300/70
                bg-blue-500
                text-white
                shadow-lg
              "
            >
              <Check className="h-3.5 w-3.5" />
            </span>
          </span>
        )}

        <span
          className="
            absolute
            inset-x-0
            bottom-0
            bg-slate-950/90
            px-1
            py-1
            text-center
            text-[9px]
            font-black
            leading-none
            tabular-nums
            tracking-wide
            text-slate-100
            backdrop-blur-sm
          "
        >
          {inclusion}
        </span>
      </span>

      <RarityBadge
        rarity={rarity}
        size="xs"
        className="absolute -top-2 right-0 z-10"
      />
    </>
  );

  if (!interactive) {
    return (
      <>
        <div
          ref={setElement}
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
          title={`${card.name} · ${inclusion}`}
          className="relative block min-w-0"
        >
          {content}
        </div>

        {anchor && (
          <CardHoverTooltip
            card={card}
            anchor={anchor}
          />
        )}
      </>
    );
  }

  return (
    <>
      <button
        ref={setElement}
        type="button"
        onClick={onToggle}
        aria-pressed={selected}
        title={`${card.name} · ${inclusion}`}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="
          group
          relative
          block
          min-w-0
          text-left
          outline-none
        "
      >
        {content}
      </button>

      {anchor && (
        <CardHoverTooltip
          card={card}
          anchor={anchor}
        />
      )}
    </>
  );
}
