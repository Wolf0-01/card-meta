"use client";

import Button from "@/components/ui/Button";
import TierBadge from "@/components/ui/TierBadge";

import { MetaDeck } from "@/types/meta";

interface Props {
  deck: MetaDeck;
}

function formatTitle(name?: string) {
  return (
    name
      ?.replaceAll("-", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  ) ?? "Deck";
}

function formatDate(date?: Date | string | null) {
  if (!date) {
    return "Sin fecha";
  }

  return new Date(date).toLocaleDateString("es-ES");
}

export default function DeckHero({
  deck,
}: Props) {
  const trendText =
    deck.trend === "up"
      ? "📈 Rising"
      : deck.trend === "down"
      ? "📉 Falling"
      : "➡ Stable";

  const trendColor =
    deck.trend === "up"
      ? "text-emerald-400"
      : deck.trend === "down"
      ? "text-red-400"
      : "text-yellow-400";

  return (
    <section
      className="
        rounded-2xl
        border
        border-border
        bg-surface
        p-8
      "
    >
      <div
        className="
          flex
          flex-col
          gap-8
          lg:flex-row
          lg:items-start
          lg:justify-between
        "
      >
        <div className="space-y-4">

          <div className="flex flex-wrap items-center gap-3">

            <h1
              className="
                text-4xl
                font-black
                tracking-tight
                text-foreground
                lg:text-5xl
              "
            >
              {formatTitle(deck.name)}
            </h1>

            <TierBadge tier={deck.tier ?? "Rogue"} />

          </div>

          <p className="text-foreground-secondary">

            {deck.archetype?.name ?? "Unknown"}

          </p>

          <p
            className="
              max-w-3xl
              leading-7
              text-foreground-secondary
            "
          >
            {deck.description ??
              "Deck competitivo del meta actual."}
          </p>

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-6
              text-sm
            "
          >

            <span className={trendColor}>
              {trendText}
            </span>

            <span className="text-foreground-muted">
              Actualizado:
              {" "}
              {formatDate(deck.updatedAt)}
            </span>

          </div>

        </div>

        <div
          className="
            flex
            flex-wrap
            gap-3
          "
        >

          <Button>
            Copiar Deck
          </Button>

          <Button variant="outline">
            Compartir
          </Button>

        </div>

      </div>

    </section>
  );
}