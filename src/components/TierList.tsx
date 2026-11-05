"use client";

import {
  MetaDeck,
  Tier
} from "@/types/meta";

import DeckMetaCard from "@/components/decks/DeckMetaCard";

interface Props {
  decks: MetaDeck[];
}

interface TierConfig {
  title: string;
  color: string;
  badge: string;
}

const tierConfig: Record<string, TierConfig> = {

  "Tier 1": {
    title: "🔥 Tier 1",
    color: "border-red-500",
    badge: "bg-red-500/20 text-red-400"
  },

  "Tier 2": {
    title: "⭐ Tier 2",
    color: "border-yellow-500",
    badge: "bg-yellow-500/20 text-yellow-400"
  },

  "Tier 3": {
    title: "⚔️ Tier 3",
    color: "border-blue-500",
    badge: "bg-blue-500/20 text-blue-400"
  },

  "Rogue": {
    title: "💎 Rogue",
    color: "border-purple-500",
    badge: "bg-purple-500/20 text-purple-400"
  }

};

export default function TierList({
  decks
}: Props) {

  const grouped = decks.reduce(

    (
      acc: Record<string, MetaDeck[]>,
      deck
    ) => {

      const tier = deck.tier ?? "Rogue";

      if (!acc[tier]) {
        acc[tier] = [];
      }

      acc[tier].push(deck);

      return acc;

    },

    {}

  );

  return (

    <div
      className="
      bg-zinc-900
      border
      border-zinc-700
      rounded-xl
      p-6
    "
    >

      <h1
        className="
        text-3xl
        font-bold
        mb-8
      "
      >
        ⚔️ Tier List
      </h1>

      {

        Object.entries(tierConfig).map(([tier, config]) => {

          const tierDecks =
            grouped[tier]
              ? [...grouped[tier]].sort(
                  (a, b) =>
                    (a.tierOrder ?? 999) -
                    (b.tierOrder ?? 999)
                )
              : [];

          if (tierDecks.length === 0) {
            return null;
          }

          return (

            <section
              key={tier}
              className="mb-10"
            >

              <h2
                className={`
                  text-2xl
                  font-bold
                  mb-4
                  border-l-4
                  pl-3
                  ${config.color}
                `}
              >
                {config.title}
              </h2>

              <div
                className="
                grid
                md:grid-cols-2
                gap-5
              "
              >

                {tierDecks.map(deck => (

                  <DeckMetaCard
                    key={deck.id}
                    deck={deck}
                    badge={config.badge}
                  />

                ))}

              </div>

            </section>

          );

        })

      }

    </div>

  );

}