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
        left-2
        top-2
        flex
        flex-col
        gap-2
      "
    >
      {card.rarity && (
        <span
          className={`
            rounded-md
            px-2
            py-1
            text-[10px]
            font-bold
            shadow-lg
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
            text-[10px]
            font-semibold
            shadow-lg
            ${getAttributeColor(card.attribute)}
          `}
        >
          {card.attribute}
        </span>
      )}
    </div>
  );
}