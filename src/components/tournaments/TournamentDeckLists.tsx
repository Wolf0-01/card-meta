import {
  Sparkles,
  Trophy,
} from "lucide-react";

import Button from "@/components/ui/Button";

import DeckExtraDeck from "@/components/decks/DeckExtraDeck";

import DeckMainDeck from "@/components/decks/DeckMainDeck";

import type { TournamentDeckEntry } from "@/lib/tournaments";

interface TournamentDeckListsProps {
  decks: TournamentDeckEntry[];
}

const RANK_STYLES: Record<number, string> = {
  1: "border-amber-300/50 bg-amber-400/15 text-amber-200",
  2: "border-slate-300/40 bg-slate-300/10 text-slate-200",
  3: "border-orange-400/40 bg-orange-400/10 text-orange-200",
};

/**
 * Sección Top Deck Lists del detalle de un torneo.
 * Renderiza una columna alineada a la izquierda por cada
 * lista del podio que tenga un mazo público vinculado.
 */
export default function TournamentDeckLists({
  decks,
}: TournamentDeckListsProps) {
  if (decks.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Top Deck Lists"
      className="space-y-4"
    >
      <div
        className="
          flex
          flex-wrap
          items-center
          gap-2
          border-b
          border-slate-800
          pb-2
        "
      >
        <Trophy className="h-4 w-4 text-amber-300" />

        <h2
          className="
            text-[11px]
            font-black
            uppercase
            tracking-[0.2em]
            text-slate-200
          "
        >
          Top Deck Lists
        </h2>

        <span
          className="
            ml-auto
            text-[9px]
            font-black
            tabular-nums
            text-slate-500
          "
        >
          {decks.length}{" "}
          {decks.length === 1 ? "list" : "lists"}
        </span>
      </div>

      <div
        className="
          max-w-lg
          space-y-8
          divide-y
          divide-slate-800
        "
      >
        {decks.map(({ placement, deck }) => {
          const totalMain = deck.mainCards ?? 0;

          return (
            <article
              key={`${placement.place}-${deck.identifier}`}
              className="space-y-3 pt-6 first:pt-1"
            >
              <header className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-md
                      border
                      text-xs
                      font-black
                      tabular-nums
                      ${
                        RANK_STYLES[placement.place] ??
                        "border-slate-700 bg-slate-800/80 text-slate-300"
                      }
                    `}
                  >
                    {placement.place}
                  </span>

                  <p className="min-w-0 flex-1 truncate text-base font-black text-white">
                    {placement.player}
                  </p>
                </div>

                <div
                  className="
                    grid
                    grid-cols-[1fr_auto_1fr]
                    items-center
                    gap-2
                    pt-0.5
                  "
                >
                  <span aria-hidden />

                  <div
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-1.5
                      text-center
                    "
                  >
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-300" />

                    <span
                      className="
                        text-xs
                        font-bold
                        tracking-wide
                        text-sky-300
                      "
                      title={deck.skill ?? "No Skill"}
                    >
                      {deck.skill?.trim() || "No Skill"}
                    </span>
                  </div>

                  <span
                    className="
                      text-right
                      text-[11px]
                      font-bold
                      tabular-nums
                      text-slate-300
                    "
                  >
                    {totalMain} cards
                  </span>
                </div>
              </header>

              <div className="py-1">
                <DeckMainDeck deck={deck} />

                <DeckExtraDeck deck={deck} />
              </div>

              <footer>
                <Button
                  variant="primary"
                  size="sm"
                  href={`/decks/new?clone=${deck.identifier}`}
                  className="w-full"
                >
                  Build in Deck Builder
                </Button>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}
