import Image from "next/image";

import Link from "next/link";

import {
  normalizeRarity,
  RARITY_STYLES,
} from "@/components/cards/cardRarity";

import type { ArchetypeBreakdown as ArchetypeBreakdownData } from "@/lib/decks";

interface ArchetypeBreakdownProps {
  breakdown: ArchetypeBreakdownData;
}

function deckFraction(
  count: number,
  total: number
): string {
  return `${count}/${total} ${
    total === 1 ? "deck" : "decks"
  }`;
}

/**
 * Bloque superior de /decks cuando hay un arquetipo
 * seleccionado. Se calcula con los mazos públicos reales y
 * se actualiza solo al publicar nuevas listas.
 */
export default function ArchetypeBreakdown({
  breakdown,
}: ArchetypeBreakdownProps) {
  const { topSkill, coreCards } = breakdown;

  return (
    <section
      aria-label={`${breakdown.archetype} archetype breakdown`}
      className="
        rounded-xl
        border
        border-slate-700/60
        bg-[#0B132B]
        p-3
        ring-1
        ring-inset
        ring-white/5
      "
    >
      <div
        className="
          flex
          flex-wrap
          items-center
          justify-between
          gap-2
          border-b
          border-slate-800
          pb-2
        "
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden
            className="
              h-3
              w-3
              shrink-0
              rotate-45
              rounded-[2px]
              bg-amber-400
              shadow-[0_0_10px_rgba(251,191,36,0.6)]
            "
          />

          <h2
            className="
              truncate
              text-[10px]
              font-black
              uppercase
              tracking-[0.2em]
              text-slate-200
            "
          >
            Archetype Breakdown
          </h2>

          <span
            className="
              shrink-0
              rounded
              border
              border-blue-400/30
              bg-blue-500/10
              px-1.5
              py-0.5
              text-[8px]
              font-black
              uppercase
              tracking-[0.12em]
              text-blue-200
            "
          >
            {breakdown.archetype}
          </span>
        </div>

        <span
          className="
            text-[9px]
            font-bold
            uppercase
            tracking-[0.14em]
            text-slate-500
          "
        >
          <span className="tabular-nums text-slate-300">
            {breakdown.deckCount}
          </span>{" "}
          {breakdown.deckCount === 1
            ? "public deck"
            : "public decks"}
        </span>
      </div>

      {topSkill && (
        <div
          className="
            mt-2
            flex
            flex-wrap
            items-center
            justify-between
            gap-2
            rounded-lg
            border
            border-amber-400/25
            bg-amber-500/[0.06]
            px-2.5
            py-2
          "
        >
          <div className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden
              className="
                h-2.5
                w-2.5
                shrink-0
                rotate-45
                rounded-[2px]
                bg-amber-400
                shadow-[0_0_10px_rgba(251,191,36,0.6)]
              "
            />

            <div className="min-w-0">
              <p
                className="
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.16em]
                  text-amber-300/80
                "
              >
                Most used skill
              </p>

              <p className="truncate text-[11px] font-black text-white">
                {topSkill.name}
              </p>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-sm font-black tabular-nums text-amber-300">
              {topSkill.percentage}%
            </p>

            <p
              className="
                text-[8px]
                font-bold
                uppercase
                tracking-[0.1em]
                text-slate-500
              "
            >
              {deckFraction(
                topSkill.deckCount,
                breakdown.deckCount
              )}
            </p>
          </div>
        </div>
      )}

      {coreCards.length > 0 && (
        <div className="mt-3">
          <div
            className="
              flex
              items-center
              justify-between
              gap-2
            "
          >
            <p
              className="
                text-[8px]
                font-black
                uppercase
                tracking-[0.18em]
                text-slate-500
              "
            >
              Core Cards
            </p>

            <p
              className="
                text-[8px]
                font-bold
                uppercase
                tracking-[0.12em]
                text-slate-600
              "
            >
              Inclusion rate
            </p>
          </div>

          <div
            className="
              mt-1.5
              grid
              grid-cols-[repeat(auto-fill,minmax(76px,1fr))]
              gap-1.5
            "
          >
            {coreCards.map((card) => {
              const rarity = normalizeRarity(
                card.rarity
              );

              const rarityStyle =
                RARITY_STYLES[rarity];

              return (
                <Link
                  key={card.id}
                  href={`/cards/${card.slug}`}
                  title={`${card.name} · ${deckFraction(
                    card.deckCount,
                    breakdown.deckCount
                  )}`}
                  className="
                    group
                    relative
                    block
                    min-w-0
                  "
                >
                  <span
                    className="
                      relative
                      block
                      aspect-[59/86]
                      overflow-hidden
                      rounded-lg
                      border
                      border-slate-700
                      bg-slate-800
                      transition-colors
                      group-hover:border-blue-400/80
                    "
                  >
                    {card.image ? (
                      <Image
                        src={card.image}
                        alt={card.name}
                        fill
                        sizes="86px"
                        className="
                          object-cover
                          transition-transform
                          duration-200
                          group-hover:scale-[1.04]
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
                          text-[9px]
                          font-black
                          text-slate-500
                        "
                      >
                        {rarity}
                      </span>
                    )}

                    <span
                      aria-hidden
                      className={`absolute inset-x-0 top-0 h-[2px] ${rarityStyle.strip}`}
                    />

                    <span
                      className={`
                        absolute
                        bottom-0
                        right-0
                        rounded-tl-md
                        px-1.5
                        py-0.5
                        text-[9px]
                        font-black
                        leading-none
                        tabular-nums
                        ring-1
                        ring-white/20
                        ${rarityStyle.badge}
                      `}
                    >
                      {card.percentage}%
                    </span>
                  </span>

                  <span
                    className="
                      mt-0.5
                      block
                      text-center
                      text-[8px]
                      font-bold
                      tabular-nums
                      text-slate-500
                    "
                  >
                    {deckFraction(
                      card.deckCount,
                      breakdown.deckCount
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
