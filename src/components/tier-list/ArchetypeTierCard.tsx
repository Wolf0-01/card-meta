import Image from "next/image";

import Link from "next/link";

import {
  ArrowUpRight,
  Layers,
  Library,
} from "lucide-react";

import { formatNumber } from "@/lib/format";

import type {
  DuelFormat,
  TierListArchetype,
} from "@/lib/tier-list";

import { TIER_BAND_META } from "./tierBands";

interface ArchetypeTierCardProps {
  archetype: TierListArchetype;

  format: DuelFormat;
}

/**
 * Tarjeta compacta de arquetipo dentro de una franja de Tier.
 * Enlaza a las listas públicas filtradas en /decks?q=.
 */
export default function ArchetypeTierCard({
  archetype,
  format,
}: ArchetypeTierCardProps) {
  const meta = TIER_BAND_META[archetype.tier];

  return (
    <Link
      href={`/decks?q=${encodeURIComponent(
        archetype.searchTerm
      )}${
        format === "rush" ? "&format=rush" : ""
      }`}
      aria-label={`Ver mazos públicos de ${archetype.name}`}
      className="
        group
        flex
        gap-2.5
        rounded-lg
        border
        border-slate-700/60
        bg-[#0B132B]
        p-2.5
        ring-1
        ring-inset
        ring-white/5
        transition-all
        duration-200
        hover:border-blue-400/70
        hover:bg-[#101A36]
        hover:shadow-[0_0_22px_rgba(59,130,246,0.14)]
      "
    >
      <div
        className="
          relative
          aspect-[59/86]
          w-[52px]
          shrink-0
          overflow-hidden
          rounded-md
          border
          border-slate-700/80
          bg-slate-800
          shadow-sm
          sm:w-[56px]
        "
      >
        {archetype.image ? (
          <Image
            src={archetype.image}
            alt={
              archetype.signatureName ??
              archetype.name
            }
            fill
            sizes="60px"
            className="
              object-cover
              transition-transform
              duration-200
              group-hover:scale-[1.05]
            "
          />
        ) : (
          <span
            aria-hidden
            className="
              flex
              h-full
              w-full
              items-center
              justify-center
              bg-[radial-gradient(circle_at_50%_20%,rgba(59,130,246,0.35),transparent_70%)]
              text-[9px]
              font-black
              uppercase
              tracking-widest
              text-slate-500
            "
          >
            {archetype.name.slice(0, 2)}
          </span>
        )}

        <span
          aria-hidden
          className={`
            pointer-events-none
            absolute
            inset-x-0
            top-0
            h-[3px]
            ${meta.bar}
          `}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3
              className="
                truncate
                text-[13px]
                font-black
                leading-4
                text-white
                transition-colors
                group-hover:text-blue-100
              "
            >
              {archetype.name}
            </h3>

            <p
              className="
                mt-0.5
                truncate
                text-[8px]
                font-bold
                uppercase
                tracking-[0.12em]
                text-slate-500
              "
            >
              {archetype.signatureName ??
                "Arquetipo"}
            </p>
          </div>

          <span
            className={`
              shrink-0
              text-right
              text-base
              font-black
              leading-none
              tabular-nums
              ${meta.accent}
            `}
          >
            {archetype.powerScore}

            <span
              className="
                block
                text-[7px]
                font-black
                uppercase
                tracking-[0.12em]
                text-slate-500
              "
            >
              Power
            </span>
          </span>
        </div>

        <div className="mt-2">
          <div
            className="
              flex
              items-center
              justify-between
              text-[7px]
              font-black
              uppercase
              tracking-[0.14em]
              text-slate-500
            "
          >
            <span>Power Ranking</span>

            <span className="tabular-nums">
              {archetype.powerScore}/100
            </span>
          </div>

          <div
            role="presentation"
            className="
              mt-1
              h-1.5
              overflow-hidden
              rounded-full
              bg-slate-800
              ring-1
              ring-inset
              ring-white/5
            "
          >
            <span
              className={`
                block
                h-full
                rounded-full
                ${meta.bar}
              `}
              style={{
                width: `${archetype.powerScore}%`,
              }}
            />
          </div>
        </div>

        <div
          className="
            mt-2
            flex
            flex-wrap
            items-center
            gap-x-2.5
            gap-y-1
            text-[8px]
            font-bold
            uppercase
            tracking-wide
            text-slate-500
          "
        >
          <span className="inline-flex items-center gap-1">
            <Layers className="h-2.5 w-2.5 shrink-0" />

            <b className="tabular-nums text-slate-200">
              {archetype.deckCount}
            </b>

            {archetype.deckCount === 1
              ? "deck"
              : "decks"}
          </span>

          <span className="inline-flex items-center gap-1">
            <Library className="h-2.5 w-2.5 shrink-0" />

            <b className="tabular-nums text-slate-200">
              {formatNumber(archetype.cardCount)}
            </b>
            cartas
          </span>

          <span
            className="
              ml-auto
              inline-flex
              items-center
              gap-0.5
              text-blue-300
              opacity-0
              transition-opacity
              group-hover:opacity-100
            "
          >
            Ver listas

            <ArrowUpRight className="h-2.5 w-2.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
