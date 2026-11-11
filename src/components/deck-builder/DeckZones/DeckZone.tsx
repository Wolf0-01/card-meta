"use client";

import { useMemo } from "react";

import CardItem from "@/components/cards/CardItem";

import type {
  BuilderCard,
  DeckZone as DeckZoneType,
} from "@/types/deck-builder";

interface DeckZoneProps {
  title: string;

  cards: BuilderCard[];

  maxCards: number;

  zone: DeckZoneType;

  onRemoveCard: (
    cardId: number,
    zone: DeckZoneType
  ) => void;

  onMoveCard: (
    cardId: number,
    from: DeckZoneType,
    to: DeckZoneType
  ) => void;

  onSetQuantity: (
    cardId: number,
    zone: DeckZoneType,
    quantity: number
  ) => void;
}

export default function DeckZone({
  title,
  cards,
  maxCards,
  zone,
  onRemoveCard,
  onMoveCard,
  onSetQuantity,
}: DeckZoneProps) {
  const totalCards = useMemo(
    () =>
      cards.reduce(
        (total, card) =>
          total + card.quantity,
        0
      ),
    [cards]
  );

  return (
    <section
      className="
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-900
        p-6
      "
    >
      <div
        className="
          mb-6
          flex
          items-center
          justify-between
        "
      >
        <h2
          className="
            text-2xl
            font-bold
            text-white
          "
        >
          {title}
        </h2>

        <span
          className="
            rounded-full
            bg-zinc-950
            px-4
            py-1
            text-sm
            font-semibold
            text-zinc-300
          "
        >
          {totalCards} / {maxCards}
        </span>
      </div>

      {cards.length === 0 ? (
        <div
          className="
            flex
            h-36
            items-center
            justify-center
            rounded-xl
            border-2
            border-dashed
            border-zinc-700
            text-zinc-500
          "
        >
          No cards
        </div>
      ) : (
        <div
          className="
            grid
            grid-cols-[repeat(auto-fill,115px)]
            justify-center
            gap-3
          "
        >
          {cards.map((deckCard) => (
            <div
              key={
                `${deckCard.card.id}-${deckCard.zone}`
              }
              className="
                w-[115px]
                space-y-2
              "
            >
              <CardItem
                card={deckCard.card}
                quantity={deckCard.quantity}
              />

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-1
                "
              >
                <button
                  type="button"
                  aria-label={
                    `Disminuir cantidad de ${deckCard.card.name}`
                  }
                  onClick={() =>
                    onSetQuantity(
                      deckCard.card.id,
                      zone,
                      deckCard.quantity - 1
                    )
                  }
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded
                    bg-zinc-800
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:bg-zinc-700
                  "
                >
                  −
                </button>

                <span
                  className="
                    min-w-7
                    text-center
                    text-xs
                    font-semibold
                    text-zinc-300
                  "
                >
                  ×{deckCard.quantity}
                </span>

                <button
                  type="button"
                  aria-label={
                    `Aumentar cantidad de ${deckCard.card.name}`
                  }
                  onClick={() =>
                    onSetQuantity(
                      deckCard.card.id,
                      zone,
                      deckCard.quantity + 1
                    )
                  }
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded
                    bg-zinc-800
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:bg-zinc-700
                  "
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() =>
                  onRemoveCard(
                    deckCard.card.id,
                    zone
                  )
                }
                className="
                  w-full
                  rounded
                  bg-red-950
                  px-2
                  py-1
                  text-xs
                  font-semibold
                  text-red-300
                  transition
                  hover:bg-red-900
                "
              >
                Remove
              </button>

              <select
                value={zone}
                onChange={(event) =>
                  onMoveCard(
                    deckCard.card.id,
                    zone,
                    event.target
                      .value as DeckZoneType
                  )
                }
                aria-label={
                  `Mover ${deckCard.card.name}`
                }
                className="
                  w-full
                  rounded
                  border
                  border-zinc-700
                  bg-zinc-950
                  px-2
                  py-1
                  text-xs
                  text-zinc-300
                  outline-none
                  focus:border-blue-500
                "
              >
                <option value="main">
                  Main Deck
                </option>

                <option value="extra">
                  Extra Deck
                </option>
              </select>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}