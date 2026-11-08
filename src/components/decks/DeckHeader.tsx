"use client";

import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

import { Zap } from "lucide-react";

import DeckActions from "./DeckActions";

import { MetaDeck } from "@/types/meta";

interface Props {
  deck: MetaDeck;
}

export default function DeckHeader({
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
            via-background/30
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
            lg:items-center
            lg:justify-between
          "
        >
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-foreground">
              {deck.name}
            </h1>

            <p
              className="
                mt-2
                text-lg
                text-foreground-muted
              "
            >
              {deck.archetypeName ??
                (typeof deck.archetype === "string"
                  ? deck.archetype
                  : deck.archetype?.name) ??
                "Arquetipo desconocido"}
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

            {deck.skill && (
              <p
                className="
                  mt-3
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-lg
                  border
                  border-amber-500/30
                  bg-amber-500/10
                  px-2.5
                  py-1
                  text-xs
                  font-semibold
                  text-amber-300
                "
              >
                <Zap className="h-3.5 w-3.5" />
                Skill: {deck.skill}
              </p>
            )}

            <div className="mt-6">
              <DeckActions deck={deck} />
            </div>
          </div>

          <div
            className="
              grid
              grid-cols-2
              gap-6
              text-center
              lg:min-w-[220px]
            "
          >
            <div>
              <p className="text-sm text-foreground-muted">
                Popularidad
              </p>

              <p
                className="
                  mt-1
                  text-3xl
                  font-bold
                  text-foreground
                "
              >
                {deck.popularity ?? 0}
              </p>
            </div>

            <div>
              <p className="text-sm text-foreground-muted">
                Top Cuts
              </p>

              <p
                className="
                  mt-1
                  text-3xl
                  font-bold
                  text-foreground
                "
              >
                {deck.tournamentResults ?? 0}
              </p>
            </div>

            <div>
              <p className="text-sm text-foreground-muted">
                Main Deck
              </p>

              <p
                className="
                  mt-1
                  text-2xl
                  font-bold
                  text-foreground
                "
              >
                {deck.mainCards ?? 0}
              </p>
            </div>

            <div>
              <p className="text-sm text-foreground-muted">
                Extra Deck
              </p>

              <p
                className="
                  mt-1
                  text-2xl
                  font-bold
                  text-foreground
                "
              >
                {deck.extraCards ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}