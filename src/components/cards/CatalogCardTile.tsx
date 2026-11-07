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

const ATTRIBUTE_STYLES: Record<
  string,
  string
> = {
  DARK: "bg-violet-600 text-white",

  LIGHT: "bg-yellow-300 text-yellow-950",

  EARTH: "bg-amber-700 text-white",

  WATER: "bg-sky-600 text-white",

  FIRE: "bg-red-600 text-white",

  WIND: "bg-emerald-600 text-white",

  DIVINE: "bg-orange-500 text-white",
};

const ATTRIBUTE_LABELS: Record<
  string,
  string
> = {
  DARK: "DRK",

  LIGHT: "LGT",

  EARTH: "ERT",

  WATER: "WTR",

  FIRE: "FIR",

  WIND: "WND",

  DIVINE: "DIV",
};

interface CatalogCardTileProps {
  card: CardPreviewData;

  priority?: boolean;
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

function getKindBadge(
  card: CardPreviewData
) {
  const type = card.type.toLowerCase();

  if (type.includes("spell")) {
    return {
      label: "SPL",
      className: "bg-blue-600 text-white",
    };
  }

  if (type.includes("trap")) {
    return {
      label: "TRP",
      className:
        "bg-fuchsia-700 text-white",
    };
  }

  return null;
}

export default function CatalogCardTile({
  card,
  priority = false,
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

  const kindBadge = getKindBadge(card);

  const attributeStyle = card.attribute
    ? ATTRIBUTE_STYLES[card.attribute] ??
      "bg-slate-600 text-white"
    : null;

  const attributeLabel = card.attribute
    ? ATTRIBUTE_LABELS[card.attribute] ??
      card.attribute.slice(0, 3)
    : null;

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
        href={`/cards/${card.id}`}
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
          max-w-[104px]
          select-none
        "
      >
        <div
          className="
            relative
            aspect-[59/86]
            overflow-hidden
            rounded-md
            border
            border-slate-700
            bg-slate-800
            shadow-sm
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
            sizes="104px"
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

          {attributeStyle &&
            attributeLabel && (
              <span
                className={`
                  absolute
                  left-1
                  top-1.5
                  rounded
                  px-1
                  py-0.5
                  text-[8px]
                  font-black
                  leading-none
                  tracking-wide
                  shadow
                  ${attributeStyle}
                `}
              >
                {attributeLabel}
              </span>
            )}

          {!attributeStyle &&
            kindBadge && (
              <span
                className={`
                  absolute
                  left-1
                  top-1.5
                  rounded
                  px-1
                  py-0.5
                  text-[8px]
                  font-black
                  leading-none
                  tracking-wide
                  shadow
                  ${kindBadge.className}
                `}
              >
                {kindBadge.label}
              </span>
            )}

          {levelLabel && (
            <span
              className="
                absolute
                right-1
                top-1.5
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

          <span
            className={`
              absolute
              left-1/2
              top-0
              z-10
              -translate-x-1/2
              rounded-b-md
              px-1.5
              py-0.5
              text-[8px]
              font-black
              leading-none
              tracking-[0.08em]
              shadow-[0_2px_8px_rgba(0,0,0,0.65)]
              ring-1
              ring-white/20
              ${rarityStyle.badge}
            `}
          >
            {rarity}
          </span>
        </div>
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
