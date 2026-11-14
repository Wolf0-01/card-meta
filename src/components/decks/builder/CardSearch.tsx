"use client";

import { useState } from "react";
import Image from "next/image";

import type {
  CardPreviewData,
} from "@/types/CardPreviewData";

interface Props {
  onAdd: (
    card: CardPreviewData
  ) => void;
}

export default function CardSearch({
  onAdd,
}: Props) {
  const [
    search,
    setSearch,
  ] = useState("");

  const [
    cards,
    setCards,
  ] = useState<CardPreviewData[]>([]);

  async function searchCards() {
    const res = await fetch(
      `/api/cards?search=${encodeURIComponent(
        search
      )}&limit=20`
    );

    const data: {
      cards?: CardPreviewData[];
    } = await res.json();

    setCards(
      data.cards ?? []
    );
  }

  return (
    <div
      className="
        bg-zinc-900
        border
        border-zinc-700
        rounded-xl
        p-5
      "
    >
      <h2
        className="
          text-xl
          font-bold
          mb-4
        "
      >
        Search cards
      </h2>

      <div
        className="
          flex
          gap-2
          mb-5
        "
      >
        <input
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          placeholder="Blue-Eyes..."
          className="
            bg-zinc-950
            border
            border-zinc-700
            rounded
            px-3
            py-2
            flex-1
          "
        />

        <button
          onClick={searchCards}
          className="
            bg-blue-600
            px-4
            rounded
          "
        >
          Search
        </button>
      </div>

      <div
        className="
          grid
          grid-cols-4
          gap-3
        "
      >
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() =>
              onAdd(card)
            }
            className="
              bg-zinc-950
              border
              border-zinc-700
              rounded
              p-2
              hover:border-blue-500
            "
          >
            <Image
              src={
                card.image ??
                "/cards/default.jpg"
              }
              alt={card.name}
              width={80}
              height={120}
              unoptimized
              className="rounded"
            />

            <p
              className="
                text-xs
                mt-2
              "
            >
              {card.name}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}