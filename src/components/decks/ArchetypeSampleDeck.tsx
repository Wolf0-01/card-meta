import Link from "next/link";

import {
  ArrowRight,
} from "lucide-react";

import Button from "@/components/ui/Button";

import {
  getAchievementShortLabel,
  isCompetitiveAchievement,
  normalizeAchievement,
} from "@/lib/decks/achievements";

import type { MetaDeck } from "@/types/meta";

import DeckExtraDeck from "./DeckExtraDeck";

import DeckMainDeck from "./DeckMainDeck";

interface ArchetypeSampleDeckProps {
  deck: MetaDeck;
}

/**
 * Bloque Sample Deck del detalle de arquetipo.
 *
 * Usa el mazo público más destacado (priorizando resultados
 * verificados de Torneo y KoG) y permite clonarlo directamente
 * en el Deck Builder con la cuadrícula de 5 columnas.
 */
export default function ArchetypeSampleDeck({
  deck,
}: ArchetypeSampleDeckProps) {
  const achievement =
    normalizeAchievement(deck.achievement);

  const showBadge =
    deck.verified === true &&
    isCompetitiveAchievement(achievement);

  return (
    <section
      aria-label="Sample deck"
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
              h-2.5
              w-2.5
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
            Sample Deck
          </h2>

          {showBadge && (
            <span
              className="
                shrink-0
                rounded
                border
                border-amber-400/40
                bg-amber-400/10
                px-1.5
                py-0.5
                text-[8px]
                font-black
                uppercase
                tracking-[0.12em]
                text-amber-300
              "
            >
              {getAchievementShortLabel(
                achievement
              )}
            </span>
          )}
        </div>

        <span
          className="
            max-w-full
            truncate
            text-[9px]
            font-bold
            uppercase
            tracking-[0.14em]
            text-slate-500
          "
        >
          {deck.skill?.trim() || "No Skill"}
        </span>
      </div>

      <div
        className="
          mt-3
          grid
          gap-4
          lg:grid-cols-[minmax(0,1fr)_220px]
          lg:items-start
        "
      >
        <div>
          <DeckMainDeck deck={deck} />

          <DeckExtraDeck deck={deck} />
        </div>

        <div className="flex flex-col gap-2">
          <p
            className="
              truncate
              text-[11px]
              font-black
              text-white
            "
            title={deck.name}
          >
            {deck.name}
          </p>

          <Button
            variant="primary"
            href={`/decks/new?clone=${deck.identifier}`}
            fullWidth
          >
            Build in Deck Builder
          </Button>

          <Link
            href={`/decks/${deck.slug}/${deck.identifier}`}
            className="
              inline-flex
              items-center
              justify-center
              gap-1
              rounded-lg
              border
              border-slate-700
              bg-slate-900/50
              px-2
              py-1.5
              text-[9px]
              font-black
              uppercase
              tracking-[0.14em]
              text-slate-300
              transition-colors
              hover:border-blue-400/60
              hover:text-blue-200
            "
          >
            View full deck
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}
