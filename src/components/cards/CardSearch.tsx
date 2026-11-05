"use client";

import {
useMemo,
useState,
} from "react";

import type {
CardPreviewData,
} from "@/types/CardPreviewData";

import CardSearchInput from "./CardSearchInput";

import EmptyState from "@/components/ui/EmptyState";

interface CardSearchProps {
cards: CardPreviewData[];

renderResults?: (
cards: CardPreviewData[]
) => React.ReactNode;
}

export default function CardSearch({
cards,
renderResults,
}: CardSearchProps) {
const [query, setQuery] =
useState("");

const filteredCards = useMemo(() => {
const search = query
.trim()
.toLowerCase();


if (!search) {
  return cards;
}

return cards.filter((card) =>
  card.name
    .toLowerCase()
    .includes(search)
);


}, [
cards,
query,
]);

return ( <section className="space-y-6"> <CardSearchInput
     value={query}
     onChange={setQuery}
   />


  {filteredCards.length > 0 ? (
    renderResults?.(
      filteredCards
    ) ?? null
  ) : (
    <EmptyState
      icon="🃏"
      title="No cards found"
      description={
        query
          ? `No cards match "${query}".`
          : "No cards available."
      }
    />
  )}
</section>


);
}
