"use client";

import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Grid from "@/components/ui/Grid";
import StatCard from "@/components/ui/StatCard";

import { MetaDeck } from "@/types/meta";

interface Props {
  deck: MetaDeck;
}

export default function ArchetypeHeader({
  deck,
}: Props) {
  return (
    <Card className="overflow-hidden">
      <div
        className="
          relative
          h-56
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

      <div className="p-6">
        <div
          className="
            flex
            flex-col
            gap-6
            lg:flex-row
            lg:justify-between
          "
        >
          <div>
            <h1 className="text-4xl font-bold">
              {deck.archetypeName ??
                (typeof deck.archetype ===
                "object"
                  ? deck.archetype?.name
                  : deck.archetype) ??
                deck.name}
            </h1>

            <p className="mt-3 text-foreground-muted">
              {deck.description ??
                "Competitive Archetype"}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>
                {deck.tier ?? "Rogue"}
              </Badge>

              <Badge variant="secondary">
                {deck.format ??
                  "Advanced"}
              </Badge>

              <Badge
                variant={
                  deck.trend === "up"
                    ? "success"
                    : deck.trend ===
                      "down"
                    ? "danger"
                    : "neutral"
                }
              >
                {deck.trend ??
                  "stable"}
              </Badge>
            </div>
          </div>
        </div>

        <Grid
          cols={5}
          gap="md"
          className="mt-8"
        >
          <StatCard
            label="META"
            value={`${deck.popularity}%`}
            variant="primary"
          />

          <StatCard
            label="WIN RATE"
            value={`${deck.winRate}%`}
            variant="success"
          />

          <StatCard
            label="TOP CUTS"
            value={
              deck.tournamentResults ??
              0
            }
            variant="warning"
          />

          <StatCard
            label="WINS"
            value={deck.wins ?? 0}
            variant="success"
          />

          <StatCard
            label="FORMAT"
            value={
              deck.format ??
              "Advanced"
            }
            variant="neutral"
          />
        </Grid>
      </div>
    </Card>
  );
}