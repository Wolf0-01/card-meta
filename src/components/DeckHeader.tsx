"use client";

import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

import { MetaDeck } from "@/types/meta";

interface Props {
  deck: MetaDeck;
}

export default function DeckHeader({
  deck,
}: Props) {
  return (
    <Card className="overflow-hidden">

      {/* Banner */}

      <div
        className="
          relative
          h-56
          w-full
          bg-gradient-to-r
          from-slate-900
          via-slate-800
          to-slate-900
        "
      >

        {deck.banner && (
          <img
            src={deck.banner}
            alt={deck.name}
            className="
              h-full
              w-full
              object-cover
              opacity-40
            "
          />
        )}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-background
            via-background/40
            to-transparent
          "
        />

      </div>

      {/* Información */}

      <div className="p-6">

        <div
          className="
            flex
            flex-col
            gap-6
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >

          <div>

            <h1
              className="
                text-4xl
                font-bold
                tracking-tight
              "
            >
              {deck.name}
            </h1>

            <p
              className="
                mt-2
                text-lg
                text-foreground-muted
              "
            >
              {deck.archetypeName}
            </p>

            <div
              className="
                mt-4
                flex
                flex-wrap
                gap-2
              "
            >

              <Badge>
                {deck.tier ?? "Rogue"}
              </Badge>

              <Badge variant="secondary">
                {deck.format ?? "Advanced"}
              </Badge>

              <Badge variant="success">
                {deck.winRate}% WR
              </Badge>

            </div>

          </div>

          <div
            className="
              grid
              grid-cols-2
              gap-6
              text-center
            "
          >

            <div>

              <p className="text-sm text-foreground-muted">
                Popularidad
              </p>

              <p className="text-3xl font-bold">
                {deck.popularity ?? 0}
              </p>

            </div>

            <div>

              <p className="text-sm text-foreground-muted">
                Top Cuts
              </p>

              <p className="text-3xl font-bold">
                {deck.tournamentResults ?? 0}
              </p>

            </div>

          </div>

        </div>

      </div>

    </Card>
  );
}