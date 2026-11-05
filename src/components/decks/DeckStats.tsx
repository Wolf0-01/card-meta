"use client";

import Grid from "@/components/ui/Grid";
import StatCard, {
  type StatCardVariant,
} from "@/components/ui/StatCard";

import { getWinRate } from "@/lib/deckUtils";

import { MetaDeck } from "@/types/meta";

interface Props {
  deck: MetaDeck;
}

interface DeckStat {
  label: string;
  value: string | number;
  variant: StatCardVariant;
}

export default function DeckStats({
  deck,
}: Props) {
  const wins = deck.wins ?? 0;
  const losses = deck.losses ?? 0;

  const winRate =
    getWinRate(
      wins,
      losses
    ) || deck.winRate || 0;

  const stats: DeckStat[] = [
    {
      label: "META",
      value: `${deck.popularity ?? 0}%`,
      variant: "primary",
    },
    {
      label: "WIN RATE",
      value: `${winRate}%`,
      variant: "success",
    },
    {
      label: "TOP CUTS",
      value: deck.tournamentResults ?? 0,
      variant: "warning",
    },
    {
      label: "WINS",
      value: wins,
      variant: "success",
    },
    {
      label: "CARDS",
      value: deck.totalCards ?? 0,
      variant: "neutral",
    },
    {
      label: "RECORD",
      value: `${wins}-${losses}`,
      variant: "primary",
    },
    {
      label: "FORMAT",
      value: deck.format ?? "Advanced",
      variant: "neutral",
    },
    {
label: "TIER RANK",
value: deck.tierOrder ?? "-",
variant: "secondary",
},

  ];

  return (
    <section className="mt-8">
      <Grid
        cols={4}
        gap="md"
      >
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            variant={stat.variant}
          />
        ))}
      </Grid>
    </section>
  );
}