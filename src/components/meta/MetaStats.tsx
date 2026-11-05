"use client";

import {
  MetaStatsData
} from "@/types/meta";

interface Props {
  stats: MetaStatsData;
}

export default function MetaStats({
  stats
}: Props) {

  const cards = [

    {
      title: "DECKS",
      value: stats.totalDecks
    },

    {
      title: "WIN RATE PROMEDIO",
      value: `${stats.averageWinRate}%`
    },

    {
      title: "FORMATO",
      value: stats.format
    },

    {
      title: "TORNEOS",
      value: stats.tournaments
    },

    {
      title: "JUGADORES",
      value: stats.totalPlayers
    },

    {
      title: "UPDATE",
      value: stats.lastUpdate
    }

  ];

  return (

    <section
      className="
      grid
      grid-cols-2
      md:grid-cols-3
      gap-4
    "
    >

      {cards.map(card => (

        <div
          key={card.title}
          className="
          bg-zinc-900
          border
          border-zinc-800
          rounded-xl
          p-4
          text-center
          hover:border-blue-500
          transition
        "
        >

          <p
            className="
            text-xs
            text-zinc-500
            font-semibold
          "
          >
            {card.title}
          </p>

          <p
            className="
            text-2xl
            font-black
            text-white
            mt-2
          "
          >
            {card.value}
          </p>

        </div>

      ))}

    </section>

  );

}