"use client";

import {
  useState,
} from "react";

import Image from "next/image";

import {
  createPortal,
} from "react-dom";

import {
  getAttributeColor,
} from "@/lib/cardColors";

import BanlistBadge from "./BanlistBadge";

import type {
  CardPreviewData,
} from "@/types/CardPreviewData";

import {
  normalizeRarity,
  RARITY_STYLES,
} from "./cardRarity";

export interface TooltipAnchor {
  top: number;

  left: number;

  right: number;

  bottom: number;

  width: number;

  height: number;
}

interface CardHoverTooltipProps {
  card: CardPreviewData;

  anchor: TooltipAnchor;
}

const TOOLTIP_WIDTH = 384;

const TOOLTIP_HEIGHT = 300;

const GAP = 12;

export default function CardHoverTooltip({
  card,
  anchor,
}: CardHoverTooltipProps) {
  const [failed, setFailed] = useState(false);

  if (typeof window === "undefined") {
    return null;
  }

  const width = Math.min(
    TOOLTIP_WIDTH,
    window.innerWidth - 16
  );

  let left = anchor.right + GAP;

  if (left + width > window.innerWidth - 8) {
    left = anchor.left - width - GAP;
  }

  if (left < 8) {
    left = Math.max(
      8,
      Math.min(
        window.innerWidth - width - 8,
        anchor.left +
          anchor.width / 2 -
          width / 2
      )
    );
  }

  const top = Math.max(
    8,
    Math.min(
      anchor.top,
      window.innerHeight - TOOLTIP_HEIGHT - 8
    )
  );

  const rarity = normalizeRarity(card.rarity);

  const rarityStyle = RARITY_STYLES[rarity];

  const level = card.linkRating
    ? `L${card.linkRating}`
    : card.level
      ? `★${card.level}`
      : "—";

  const imageSrc =
    failed || !card.image
      ? "/cards/default.jpg"
      : card.image;

  return createPortal(
    <div
      style={{
        position: "fixed",
        left,
        top,
        width,
      }}
      className="
        pointer-events-none
        z-[140]
        overflow-hidden
        rounded-xl
        border
        border-slate-600/80
        bg-[#0B132B]
        shadow-[0_24px_60px_-12px_rgba(0,0,0,0.95)]
        ring-1
        ring-white/5
      "
    >
      <span
        aria-hidden
        className={`
          absolute
          inset-x-0
          top-0
          h-[3px]
          ${rarityStyle.strip}
          ${rarityStyle.glow}
        `}
      />

      <div className="flex gap-3 p-3 pt-4">
        <div
          className="
            relative
            aspect-[813/1185]
            w-[124px]
            shrink-0
            self-start
            overflow-hidden
            rounded-lg
            border
            border-slate-600/70
            bg-slate-800
          "
        >
          <Image
            src={imageSrc}
            alt={card.name}
            fill
            sizes="124px"
            unoptimized={failed}
            onError={() => setFailed(true)}
            className="object-contain"
          />

          <span className="absolute left-1.5 top-1.5 z-10">
            <BanlistBadge
              status={card.banlistStatus}
              size="md"
            />
          </span>
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <h3
            className="
              line-clamp-2
              text-sm
              font-black
              leading-tight
              text-white
            "
          >
            {card.name}
          </h3>

          <p
            className="
              truncate
              text-[10px]
              font-semibold
              uppercase
              tracking-wide
              text-slate-400
            "
          >
            {card.type}

            {card.race
              ? ` · ${card.race}`
              : ""}
          </p>

          <div className="grid grid-cols-2 gap-1.5">
            <div
              className="
                rounded-md
                border
                border-slate-700/60
                bg-slate-900/60
                px-1.5
                py-1
              "
            >
              <p className="text-[8px] font-bold uppercase tracking-wider text-slate-500">
                Attribute
              </p>

              <p
                className={`mt-0.5 inline-flex rounded px-1 py-0.5 text-[9px] font-black ${
                  card.attribute
                    ? getAttributeColor(
                        card.attribute
                      )
                    : "bg-slate-700 text-slate-200"
                }`}
              >
                {card.attribute ?? "—"}
              </p>
            </div>

            <div
              className="
                rounded-md
                border
                border-slate-700/60
                bg-slate-900/60
                px-1.5
                py-1
              "
            >
              <p className="text-[8px] font-bold uppercase tracking-wider text-slate-500">
                Level
              </p>

              <p className="mt-0.5 text-[10px] font-black text-amber-300">
                {level}
              </p>
            </div>

            <div
              className="
                rounded-md
                border
                border-slate-700/60
                bg-slate-900/60
                px-1.5
                py-1
              "
            >
              <p className="text-[8px] font-bold uppercase tracking-wider text-slate-500">
                ATK
              </p>

              <p className="mt-0.5 text-[10px] font-black text-red-300">
                {card.attack ?? "—"}
              </p>
            </div>

            <div
              className="
                rounded-md
                border
                border-slate-700/60
                bg-slate-900/60
                px-1.5
                py-1
              "
            >
              <p className="text-[8px] font-bold uppercase tracking-wider text-slate-500">
                DEF
              </p>

              <p className="mt-0.5 text-[10px] font-black text-sky-300">
                {card.defense ?? "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`
                rounded
                px-1.5
                py-0.5
                text-[9px]
                font-black
                tracking-wide
                ring-1
                ring-white/25
                ${rarityStyle.badge}
              `}
            >
              {rarity}
            </span>

            {card.archetype && (
              <span
                className="
                  truncate
                  text-[9px]
                  font-semibold
                  text-slate-400
                "
              >
                {card.archetype}
              </span>
            )}
          </div>

          <p
            className="
              line-clamp-4
              text-[10px]
              leading-4
              text-slate-400
            "
          >
            {card.description ??
              "No description."}
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
