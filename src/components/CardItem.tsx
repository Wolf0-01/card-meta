"use client";

import Link from "next/link";
import Image from "next/image";

import Card from "@/components/ui/Card";

import CardTooltip from "@/components/cards/CardTooltip";
import DeckCardBadges from "@/components/decks/DeckCardBadges";

import { addCardToDeck } from "@/lib/deckStorage";
import { getCardFrameColor } from "@/lib/cardColors";

import { Card as DuelCard } from "@/types/card";

interface CardItemProps {
  card: DuelCard;
  showButton?: boolean;
}

export default function CardItem({
  card,
  showButton = true,
}: CardItemProps) {
  function handleAddDeck() {
    try {
      addCardToDeck({
        id: String(card.id),
        name: card.name,
        image: card.image ?? "/cards/default.jpg",
        quantity: 1,
      });

      alert(`${card.name} añadida al deck`);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  }

  return (
    <Card
      hover
      className={`
        group
        relative
        overflow-hidden
        border-2
        ${getCardFrameColor(card.type)}
      `}
    >
      <Link href={`/cards/${card.id}`}>

        <div
          className="
            relative
            mb-4
            flex
            justify-center
          "
        >
          <Image
            src={
              card.image ??
              "/cards/default.jpg"
            }
            alt={card.name}
            width={220}
            height={320}
            sizes="220px"
            className="
              rounded-lg
              object-contain
              transition-transform
              duration-300
              group-hover:scale-105
            "
          />

          <DeckCardBadges card={card} />
        </div>

        <h3
          className="
            truncate
            text-lg
            font-bold
            text-foreground
          "
        >
          {card.name}
        </h3>

        <div
          className="
            mt-3
            space-y-1
            text-sm
            text-foreground-secondary
          "
        >
          <p>
            Tipo: {card.type}
          </p>

          <p>
            Rareza: {card.rarity ?? "N/A"}
          </p>
        </div>

        <div
          className="
            mt-4
            flex
            items-center
            justify-between
            border-t
            border-border
            pt-3
            text-sm
            font-semibold
          "
        >
          <span className="text-red-400">
            ⚔ {card.attack ?? "-"}
          </span>

          <span className="text-blue-400">
            🛡 {card.defense ?? "-"}
          </span>
        </div>
      </Link>

      {showButton && (
        <button
          onClick={handleAddDeck}
          className="
            mt-5
            w-full
            rounded-lg
            bg-primary
            py-2.5
            text-sm
            font-semibold
            text-white
            transition-colors
            duration-200
            hover:bg-primary-hover
          "
        >
          Añadir al Deck
        </button>
      )}

      <CardTooltip card={card} />
    </Card>
  );
}