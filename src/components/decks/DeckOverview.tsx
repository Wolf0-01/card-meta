"use client";

import Card from "@/components/ui/Card";

import { getDuelFormatLabel } from "@/lib/duelFormat";

import { MetaDeck } from "@/types/meta";

interface Props {
  deck: MetaDeck;
}

export default function DeckOverview({
  deck,
}: Props) {
  return (
    <Card className="p-6">

      <h2
        className="
          text-2xl
          font-bold
          mb-6
        "
      >
        Deck Overview
      </h2>

      <div
        className="
          grid
          gap-6
          md:grid-cols-2
          lg:grid-cols-4
        "
      >

        <OverviewItem
          label="Tier"
          value={deck.tier ?? "-"}
        />

        <OverviewItem
          label="Format"
          value={getDuelFormatLabel(
            deck.format
          )}
        />

        <OverviewItem
          label="Arquetipo"
          value={
            deck.archetypeName ??
            "-"
          }
        />

        <OverviewItem
          label="Cards"
          value={
            String(
              deck.totalCards ?? 0
            )
          }
        />

        <OverviewItem
          label="Popularidad"
          value={`${deck.popularity ?? 0}%`}
        />

        <OverviewItem
          label="Victorias"
          value={String(deck.wins)}
        />

        <OverviewItem
          label="Derrotas"
          value={String(deck.losses)}
        />

        <OverviewItem
          label="Win Rate"
          value={`${deck.winRate}%`}
        />

      </div>

    </Card>
  );
}

interface OverviewItemProps {
  label: string;
  value: string;
}

function OverviewItem({
  label,
  value,
}: OverviewItemProps) {
  return (
    <div>

      <p
        className="
          text-sm
          text-foreground-muted
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          text-xl
          font-bold
        "
      >
        {value}
      </p>

    </div>
  );
}

