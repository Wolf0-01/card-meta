import Button from "@/components/ui/Button";

import {
  getAchievementShortLabel,
  isCompetitiveAchievement,
  normalizeAchievement,
} from "@/lib/decks/achievements";

import { formatDeckDate } from "@/lib/decks/formatDeckDate";

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
 * verificados de Torneo y KoG) y lo presenta como una tarjeta
 * vertical compacta, con la Skill, el conteo de cartas y la
 * cuadrícula continua de 5 columnas de Duel Links Meta.
 */
export default function ArchetypeSampleDeck({
  deck,
}: ArchetypeSampleDeckProps) {
  const achievement =
    normalizeAchievement(deck.achievement);

  const showBadge =
    deck.verified === true &&
    isCompetitiveAchievement(achievement);

  const author =
    deck.author?.displayName?.trim() ||
    deck.author?.username?.trim() ||
    null;

  const date = formatDeckDate(deck.createdAt);

  const meta = [
    date !== "-" ? date : null,
    author,
  ]
    .filter(Boolean)
    .join(" · ");

  const totalCards = (deck.cards ?? []).reduce(
    (total, card) =>
      total + Math.max(card.quantity, 1),
    0
  );

  return (
    <section
      aria-label="Sample deck"
      className="mx-auto w-full max-w-md"
    >
      <div
        className="
          overflow-hidden
          rounded-xl
          border
          border-slate-700/60
          bg-[#0B132B]
          ring-1
          ring-inset
          ring-white/5
        "
      >
        <header
          className="
            space-y-1.5
            border-b
            border-slate-800
            px-3
            py-2.5
          "
        >
          <div
            className="
              flex
              flex-wrap
              items-center
              justify-between
              gap-1.5
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

            {meta && (
              <span
                className="
                  max-w-full
                  truncate
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-slate-500
                "
              >
                {meta}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-1.5">
              <span
                aria-hidden
                className="
                  h-1.5
                  w-1.5
                  shrink-0
                  rotate-45
                  rounded-[1px]
                  bg-amber-400
                  shadow-[0_0_6px_rgba(251,191,36,0.55)]
                "
              />

              <span
                className="
                  truncate
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-amber-300
                "
              >
                {deck.skill?.trim() || "No Skill"}
              </span>
            </span>

            <span
              className="
                shrink-0
                text-[10px]
                font-black
                tabular-nums
                text-slate-400
              "
            >
              {totalCards}{" "}
              {totalCards === 1 ? "card" : "cards"}
            </span>
          </div>
        </header>

        <div className="px-3 py-3">
          <DeckMainDeck deck={deck} />

          <DeckExtraDeck deck={deck} />
        </div>

        <div
          className="
            border-t
            border-slate-800
            px-3
            py-3
          "
        >
          <Button
            variant="primary"
            href={`/decks/new?clone=${deck.identifier}`}
            fullWidth
          >
            Build in Deck Builder
          </Button>
        </div>
      </div>
    </section>
  );
}
