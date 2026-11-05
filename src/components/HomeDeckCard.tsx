import Link from "next/link";

import Card from "@/components/ui/Card";
import TierBadge from "@/components/ui/TierBadge";

interface Archetype {
  name: string;
}

interface Deck {
  name: string;
  tier: string | null;
  archetype?: Archetype | null;
  wins?: number;
  losses?: number;
  popularity: number;
  slug: string;
  identifier: string;
}

interface Props {
  deck: Deck;
}

export default function HomeDeckCard({ deck }: Props) {
  const games = (deck.wins ?? 0) + (deck.losses ?? 0);

  const winRate =
    games > 0
      ? Math.round(((deck.wins ?? 0) / games) * 100)
      : 0;

  return (
    <Link href={`/decks/${deck.slug}/${deck.identifier}`}>

      <Card className="p-5">

        {/* Header */}
        <div className="flex items-start justify-between">

          <div>

            <h3
              className="
                text-xl
                font-bold
                text-foreground
              "
            >
              {deck.name}
            </h3>

            <p
              className="
                mt-1
                text-sm
                text-foreground-secondary
              "
            >
              {deck.archetype?.name ?? "Sin Archetype"}
            </p>

          </div>

          <TierBadge tier={deck.tier} />

        </div>

        {/* Estadísticas */}
        <div
          className="
            mt-5
            grid
            grid-cols-2
            gap-3
          "
        >

          <div
            className="
              rounded-lg
              bg-background
              p-3
              text-center
            "
          >

            <p
              className="
                text-xs
                text-foreground-muted
              "
            >
              WIN RATE
            </p>

            <p
              className="
                mt-1
                text-lg
                font-bold
                text-green-400
              "
            >
              {winRate}%
            </p>

          </div>

          <div
            className="
              rounded-lg
              bg-background
              p-3
              text-center
            "
          >

            <p
              className="
                text-xs
                text-foreground-muted
              "
            >
              META
            </p>

            <p
              className="
                mt-1
                text-lg
                font-bold
                text-primary
              "
            >
              {deck.popularity}%
            </p>

          </div>

        </div>

        {/* Footer */}
        <div
          className="
            mt-5
            font-semibold
            text-primary
          "
        >
          Ver Deck →
        </div>

      </Card>

    </Link>
  );
}