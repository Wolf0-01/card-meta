"use client";

import {
  getAttributeColor,
  getRarityColor,
} from "@/lib/cardColors";

import { DeckCardInfo } from "@/types/deck";

interface DeckCardBadgesProps {
  card: DeckCardInfo;
}

export default function DeckCardBadges({
  card,
}: DeckCardBadgesProps) {
  return (
    <div
      className="
        absolute
        left-1
        top-1
        flex
        flex-col
        gap-1
      "
    >
      {card.rarity && (
        <span
          className={`
            rounded
            px-1
            py-0.5
            text-[8px]
            font-bold
            leading-none
            tracking-wide
            shadow
            ${getRarityColor(card.rarity)}
          `}
        >
          {card.rarity}
        </span>
      )}

      {card.attribute && (
        <span
          className={`
            rounded
            px-1
            py-0.5
            text-[8px]
            font-semibold
            leading-none
            tracking-wide
            shadow
            ${getAttributeColor(card.attribute)}
          `}
        >
          {card.attribute}
        </span>
      )}
    </div>
  );
}