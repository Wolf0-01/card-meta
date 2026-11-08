"use client";

import Image from "next/image";

import { DeckCardInfo } from "@/types/deck";

import {
  getAttributeColor,
  getCardFrameColor,
  getRarityColor,
} from "@/lib/cardColors";

interface CardHoverPreviewProps {
  card: DeckCardInfo;
}

export default function CardHoverPreview({
  card,
}: CardHoverPreviewProps) {
  const level =
    card.level ??
    card.linkRating ??
    0;

  return (
    <div
      className="
        pointer-events-none
        absolute
        left-full
        top-0
        z-50
        ml-5
        hidden
        w-[360px]
        rounded-2xl
        border
        border-zinc-700
        bg-zinc-950
        p-5
        shadow-2xl
        group-hover:block
      "
    >
      <div
        className={`
          relative
          overflow-hidden
          rounded-xl
          border-2
          ${getCardFrameColor(card.type)}
        `}
      >
        <Image
          src={
            card.image ??
            "/images/cards/card-placeholder.webp"
          }
          alt={card.name}
          width={340}
          height={500}
          className="w-full object-cover"
        />

        <div className="absolute left-3 top-3 flex gap-2">
          {card.rarity && (
            <span
              className={`
                rounded-md
                px-2
                py-1
                text-xs
                font-bold
                ${getRarityColor(card.rarity)}
              `}
            >
              {card.rarity}
            </span>
          )}

          {card.attribute && (
            <span
              className={`
                rounded-md
                px-2
                py-1
                text-xs
                font-bold
                ${getAttributeColor(card.attribute)}
              `}
            >
              {card.attribute}
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-3">

        <h2 className="text-xl font-black text-white">
          {card.name}
        </h2>

        <div className="flex flex-wrap gap-3 text-sm text-zinc-300">

          <span>{card.type}</span>

          {card.race && (
            <span>{card.race}</span>
          )}

          {level > 0 && (
            <span>
              Level {level}
            </span>
          )}

        </div>

        {(card.attack !== null ||
          card.defense !== null) && (
          <div className="flex gap-6 text-sm font-bold">

            <span className="text-red-400">
              ATK {card.attack ?? "-"}
            </span>

            <span className="text-blue-400">
              DEF {card.defense ?? "-"}
            </span>

          </div>
        )}

        {card.description && (
          <p
            className="
              text-sm
              leading-6
              text-zinc-400
            "
          >
            {card.description}
          </p>
        )}
      </div>
    </div>
  );
}