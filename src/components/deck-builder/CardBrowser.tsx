"use client";

import { useMemo, useState } from "react";

import CardSearchInput from "@/components/cards/CardSearchInput";
import CardGrid from "@/components/cards/CardGrid";

import EmptyState from "@/components/ui/EmptyState";

import type {
  CardPreviewData,
} from "@/types/CardPreviewData";

interface CardBrowserProps {
  cards: CardPreviewData[];

  onAddCard?: (
    card: CardPreviewData
  ) => void;
}

export default function CardBrowser({
  cards,
  onAddCard,
}: CardBrowserProps) {
  const [search, setSearch] =
    useState("");

  const filteredCards = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return cards;
    }

    return cards.filter((card) =>
      card.name
        .toLowerCase()
        .includes(query)
    );
  }, [cards, search]);

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
      <div className="mb-6">
        <h2
          className="
            text-2xl
            font-bold
            text-white
          "
        >
          Card Browser
        </h2>

        <p
          className="
            mt-2
            text-sm
            text-zinc-400
          "
        >
          Search cards and click one to add it to your deck.
        </p>
      </div>

      <CardSearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search cards..."
      />

      <div className="mt-6">
        {filteredCards.length === 0 ? (
          <EmptyState
            title="No cards found"
            description="Try another search."
          />
        ) : (
          <CardGrid
            title="Available Cards"
            cards={filteredCards}
            showCount={false}
            onCardClick={onAddCard}
          />
        )}
      </div>
    </section>
  );
}

