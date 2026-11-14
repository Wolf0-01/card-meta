"use client";

import { getDeckArchetypeLabel } from "@/lib/decks/archetypeLabel";

import type { MetaDeck } from "@/types/meta";

interface Props {
  deck: MetaDeck;
}

export default function DeckArchetypeBanner({
  deck,
}: Props) {
  const banner =
    deck.banner ??
    deck.image ??
    deck.archetype?.image ??
    null;

  const archetype =
    getDeckArchetypeLabel(deck);

  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-2xl
        border
        border-border
        bg-background-secondary
      "
    >
      <div className="relative aspect-[16/10]">
        {banner ? (
          // Los banners vienen de S3 o de URLs manuales: no pasan por next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={banner}
            alt={`Banner de ${archetype}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="
              h-full
              w-full
              bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.35),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.25),transparent_50%)]
            "
          />
        )}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-[#070b14]
            via-[#070b14]/40
            to-transparent
          "
        />

        <div className="absolute inset-x-0 bottom-0 p-4">
          <p
            className="
              text-[9px]
              font-black
              uppercase
              tracking-[0.2em]
              text-amber-300
            "
          >
            Arquetipo
          </p>

          <h2
            className="
              mt-1
              text-xl
              font-black
              leading-tight
              text-white
            "
          >
            {archetype} Breakdown
          </h2>

          <p
            className="
              mt-1
              text-[11px]
              font-semibold
              text-white/60
            "
          >
            Decklist and competitive guide
          </p>
        </div>
      </div>
    </div>
  );
}
