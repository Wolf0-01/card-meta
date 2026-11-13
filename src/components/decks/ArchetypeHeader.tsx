import Image from "next/image";

import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";

import { getDuelFormatLabel } from "@/lib/duelFormat";

import { MetaDeck } from "@/types/meta";

interface Props {
  deck: MetaDeck;
}

const tierStyle: Record<string, string> = {
  "Tier 1":
    "bg-red-500/20 text-red-400 border-red-500",

  "Tier 2":
    "bg-yellow-500/20 text-yellow-400 border-yellow-500",

  "Tier 3":
    "bg-blue-500/20 text-blue-400 border-blue-500",

  Rogue:
    "bg-purple-500/20 text-purple-400 border-purple-500",
};

export default function ArchetypeHeader({
  deck,
}: Props) {
  return (
    <Card className="overflow-hidden">
      {/* Banner */}

      <div className="relative h-64 w-full">
        {deck.banner ? (
          <Image
            src={deck.banner}
            alt={deck.name}
            fill
            priority
            className="
              object-cover
              opacity-40
            "
          />
        ) : (
          <div
            className="
              h-full
              w-full
              bg-gradient-to-r
              from-slate-900
              via-slate-800
              to-slate-900
            "
          />
        )}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-zinc-950
            via-zinc-950/40
            to-transparent
          "
        />
      </div>

      <div className="p-6">
        <div
          className="
            flex
            flex-col
            gap-8
            lg:flex-row
            lg:justify-between
          "
        >
          {/* Información */}

          <div className="flex-1">
            <div
              className="
                flex
                flex-wrap
                items-center
                gap-3
              "
            >
              <h1 className="text-4xl font-bold">
                {deck.archetypeName ??
                  deck.name}
              </h1>

              <Badge
                className={
                  tierStyle[
                    deck.tier ?? ""
                  ]
                }
              >
                {deck.tier ??
                  "Rogue"}
              </Badge>
            </div>

            <p
              className="
                mt-3
                text-zinc-400
              "
            >
              {deck.description ??
                "Deck competitivo"}
            </p>

            <div
              className="
                mt-6
                flex
                flex-wrap
                gap-3
              "
            >
              <Badge variant="secondary">
                {getDuelFormatLabel(deck.format)}
              </Badge>

              <Badge variant="success">
                {deck.winRate}% WR
              </Badge>

              <Badge>
                {deck.popularity}% Meta
              </Badge>
            </div>
          </div>

          {/* Imagen */}

          <div
            className="
              relative
              h-60
              w-44
              overflow-hidden
              rounded-xl
              border
              border-zinc-700
              shadow-xl
            "
          >
            {deck.image ? (
              <Image
                src={deck.image}
                alt={deck.name}
                fill
                className="object-cover"
              />
            ) : (
              <div
                className="
                  flex
                  h-full
                  items-center
                  justify-center
                  bg-zinc-900
                  text-zinc-500
                "
              >
                Sin imagen
              </div>
            )}
          </div>
        </div>

        <div
          className="
            mt-8
            grid
            grid-cols-2
            gap-4
            md:grid-cols-5
          "
        >
          <StatCard
            title="Meta"
            value={`${deck.popularity}%`}
          />

          <StatCard
            title="Win Rate"
            value={`${deck.winRate}%`}
          />

          <StatCard
            title="Top Cuts"
            value={
              deck.tournamentResults ??
              0
            }
          />

          <StatCard
            title="Wins"
            value={
              deck.wins ?? 0
            }
          />

          <StatCard
            title="Format"
            value={getDuelFormatLabel(
              deck.format
            )}
          />
        </div>
      </div>
    </Card>
  );
}