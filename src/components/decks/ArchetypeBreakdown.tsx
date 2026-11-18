"use client";

import {
  useId,
  useState,
} from "react";

import Image from "next/image";

import {
  Check,
  ChevronDown,
  X,
} from "lucide-react";

import {
  normalizeRarity,
  RARITY_STYLES,
} from "@/components/cards/cardRarity";

import type { ArchetypeBreakdown as ArchetypeBreakdownData } from "@/lib/decks";

import { useArchetypeCardFilter } from "./ArchetypeCardFilterContext";

interface ArchetypeBreakdownProps {
  breakdown: ArchetypeBreakdownData;

  /**
   * Solo ADMIN y EDITOR pueden usar las Core Cards como
   * filtro de la tabla. El resto de visitantes ve los
   * porcentajes de inclusión como información de solo
   * lectura.
   */
  canFilterBreakdown?: boolean;
}

function deckFraction(
  count: number,
  total: number
): string {
  return `${count}/${total} ${
    total === 1 ? "deck" : "decks"
  }`;
}

interface CoreCardTileProps {
  card: ArchetypeBreakdownData["coreCards"][number];

  totalDecks: number;

  interactive: boolean;

  selected: boolean;

  onToggle: () => void;
}

function CoreCardTile({
  card,
  totalDecks,
  interactive,
  selected,
  onToggle,
}: CoreCardTileProps) {
  const rarity = normalizeRarity(card.rarity);

  const rarityStyle = RARITY_STYLES[rarity];

  const fraction = deckFraction(
    card.deckCount,
    totalDecks
  );

  const title = `${card.name} · ${fraction}`;

  const content = (
    <>
      <span
        className={`
          relative
          block
          aspect-[59/86]
          overflow-hidden
          rounded-lg
          border
          bg-slate-800
          transition-colors
          ${
            selected
              ? "border-blue-400 ring-2 ring-blue-400/60"
              : interactive
                ? "border-slate-700 group-hover:border-blue-400/80 group-focus-visible:border-blue-400/80"
                : "border-slate-700"
          }
        `}
      >
        {card.image ? (
          <Image
            src={card.image}
            alt={card.name}
            fill
            sizes="86px"
            className={`
              object-cover
              ${
                interactive
                  ? "transition-transform duration-200 group-hover:scale-[1.04]"
                  : ""
              }
            `}
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

        {selected && (
          <span
            aria-hidden
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              bg-blue-950/45
            "
          >
            <span
              className="
                flex
                h-6
                w-6
                items-center
                justify-center
                rounded-full
                border
                border-blue-300/70
                bg-blue-500
                text-white
                shadow-lg
              "
            >
              <Check className="h-3.5 w-3.5" />
            </span>
          </span>
        )}
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
        {fraction}
      </span>
    </>
  );

  if (!interactive) {
    return (
      <div
        title={title}
        className="relative block min-w-0"
      >
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      title={title}
      className="
        group
        relative
        block
        min-w-0
        text-left
        outline-none
      "
    >
      {content}
    </button>
  );
}

/**
 * Bloque superior de /decks cuando hay un arquetipo
 * seleccionado. Se calcula con los mazos públicos reales y
 * se actualiza solo al publicar nuevas listas.
 *
 * El encabezado se puede colapsar y cada Core Card actúa
 * como filtro de la tabla de mazos.
 */
export default function ArchetypeBreakdown({
  breakdown,
  canFilterBreakdown = false,
}: ArchetypeBreakdownProps) {
  const { topSkill, coreCards } = breakdown;

  const [expanded, setExpanded] =
    useState(true);

  const panelId = useId();

  const filter = useArchetypeCardFilter();

  const selectedCardId =
    filter?.selected?.id ?? null;

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
      <button
        type="button"
        onClick={() =>
          setExpanded((current) => !current)
        }
        aria-expanded={expanded}
        aria-controls={panelId}
        className="
          flex
          w-full
          flex-wrap
          items-center
          justify-between
          gap-2
          border-b
          border-slate-800
          pb-2
          text-left
          outline-none
          transition-colors
          hover:border-slate-700
          focus-visible:border-blue-400/60
        "
      >
        <span className="flex min-w-0 items-center gap-2">
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

          <span
            role="heading"
            aria-level={2}
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
          </span>

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
        </span>

        <span className="flex shrink-0 items-center gap-2">
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

          <ChevronDown
            aria-hidden
            className={`
              h-3.5
              w-3.5
              text-slate-500
              transition-transform
              duration-200
              ${
                expanded
                  ? ""
                  : "-rotate-90"
              }
            `}
          />
        </span>
      </button>

      <div
        id={panelId}
        hidden={!expanded}
      >
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
                {canFilterBreakdown
                  ? "Click to filter · Inclusion rate"
                  : "Inclusion rate"}
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
              {coreCards.map((card) => (
                <CoreCardTile
                  key={card.id}
                  card={card}
                  totalDecks={breakdown.deckCount}
                  interactive={canFilterBreakdown}
                  selected={
                    canFilterBreakdown &&
                    selectedCardId === card.id
                  }
                  onToggle={() =>
                    filter?.toggle({
                      id: card.id,

                      name: card.name,
                    })
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {canFilterBreakdown && filter?.selected && (
        <div
          className="
            mt-2.5
            flex
            flex-wrap
            items-center
            justify-between
            gap-2
            rounded-lg
            border
            border-blue-400/30
            bg-blue-500/10
            px-2.5
            py-1.5
          "
        >
          <p className="min-w-0 truncate text-[10px] font-bold text-blue-200">
            Filtering decks with{" "}
            <span className="font-black text-white">
              {filter.selected.name}
            </span>
          </p>

          <button
            type="button"
            onClick={filter.clear}
            className="
              inline-flex
              shrink-0
              items-center
              gap-1
              rounded-md
              border
              border-blue-400/30
              bg-blue-500/10
              px-1.5
              py-0.5
              text-[9px]
              font-black
              uppercase
              tracking-wide
              text-blue-200
              transition-colors
              hover:bg-blue-500/20
              hover:text-white
            "
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        </div>
      )}
    </section>
  );
}
