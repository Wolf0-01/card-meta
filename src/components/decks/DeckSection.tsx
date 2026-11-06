"use client";

import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Grid from "@/components/ui/Grid";

import DeckCard from "./DeckCard";

import { DECK_RULES } from "@/lib/decks/rules";

type DeckZone = "main" | "extra" | "side";

interface DeckCardData {
  id: string;
  quantity: number;
  zone: DeckZone;

  card: {
    id: number;
    name: string;
    image: string | null;
    type?: string;
  };
}

interface Props {
  title: string;
  cards: DeckCardData[];
}

export default function DeckSection({
  title,
  cards,
}: Props) {
  const totalCards = cards.reduce(
    (total, item) => total + (item.quantity ?? 1),
    0
  );

  const titleUpper = title.toUpperCase();

  const maxCards = titleUpper.includes("MAIN")
    ? DECK_RULES.mainMax
    : titleUpper.includes("EXTRA")
    ? DECK_RULES.extraMax
    : DECK_RULES.sideMax;

  const emptyMessage = titleUpper.includes("MAIN")
    ? "No hay cartas en el Main Deck."
    : titleUpper.includes("EXTRA")
      ? "No hay cartas en el Extra Deck."
      : "No hay cartas en el Side Deck.";

  return (
    <Card className="p-6">
      <header
        className="
          mb-6
          flex
          items-center
          justify-between
          border-b
          border-border
          pb-4
        "
      >
        <div>
          <h2
            className="
              text-2xl
              font-bold
              tracking-wide
              text-foreground
            "
          >
            {title}
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-foreground-muted
            "
          >
            {totalCards} / {maxCards} cartas
          </p>
        </div>

        <span
          className="
            rounded-full
            border
            border-primary/30
            bg-primary/10
            px-3
            py-1
            text-sm
            font-semibold
            text-primary
          "
        >
          {totalCards}
        </span>
      </header>

      {cards.length === 0 ? (
        <EmptyState
          icon="🃏"
          title={emptyMessage}
        />
      ) : (
        <Grid cols={6} gap="md">
          {cards.map((item) => (
            <DeckCard
              key={item.id}
              card={item}
            />
          ))}
        </Grid>
      )}
    </Card>
  );
}