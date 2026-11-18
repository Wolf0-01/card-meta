"use client";

import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { getDeckArchetypeLabel } from "@/lib/decks/archetypeLabel";

import type { MetaDeck } from "@/types/meta";

interface Props {
  deck: MetaDeck;

  /**
   * Destino de la tarjeta: la guía publicada del arquetipo
   * o el explorador de mazos filtrado por arquetipo.
   */
  href: string;
}

export default function DeckArchetypeBanner({
  deck,
  href,
}: Props) {
  const banner =
    deck.banner ??
    deck.image ??
    deck.archetype?.image ??
    null;

  const archetype =
    getDeckArchetypeLabel(deck);

  return (
    <Link
      href={href}
      className="
        group
        relative
        block
        overflow-hidden
        rounded-2xl
        border
        border-border
        bg-background-secondary
        outline-none
        transition-colors
        hover:border-blue-400/60
        focus-visible:border-blue-400/60
        focus-visible:ring-2
        focus-visible:ring-blue-500/40
      "
    >
      <div className="relative aspect-[16/10]">
        {banner ? (
          // Los banners vienen de S3 o de URLs manuales: no pasan por next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={banner}
            alt={`Banner for ${archetype}`}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-300
              group-hover:scale-[1.03]
            "
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
            Archetype
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

          <span
            className="
              mt-2
              inline-flex
              items-center
              gap-1
              text-[9px]
              font-black
              uppercase
              tracking-[0.14em]
              text-blue-300/80
              transition-colors
              group-hover:text-blue-200
            "
          >
            View archetype
            <ArrowRight
              className="
                h-3
                w-3
                transition-transform
                duration-200
                group-hover:translate-x-0.5
              "
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
