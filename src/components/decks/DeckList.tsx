"use client";

import Grid from "@/components/ui/Grid";

import DeckListCard from "./DeckListCard";

import { MetaDeck } from "@/types/meta";

interface Props {
  decks: MetaDeck[];

  emptyMessage?: string;
}

export default function DeckList({
  decks,
  emptyMessage = "No decks available.",
}: Props) {
  if (decks.length === 0) {
    return (
      <div
        className="
          rounded-xl
          border
          border-border
          bg-card
          p-8
          text-center
          text-foreground-muted
        "
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <Grid
      cols={3}
      gap="lg"
    >
      {decks.map((deck) => (
        <DeckListCard
          key={deck.identifier ?? deck.id}
          deck={deck}
        />
      ))}
    </Grid>
  );
}