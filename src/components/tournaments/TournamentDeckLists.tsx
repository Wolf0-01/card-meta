import Link from "next/link";

import {
  ArrowUpRight,
  Layers,
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
 * Renderiza una tarjeta compacta por cada lista del podio
 * que tenga un mazo público vinculado.
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
      className="space-y-3"
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
          mx-auto
          max-w-md
          space-y-8
          divide-y
          divide-slate-800
        "
      >
        {decks.map(({ placement, deck }) => {
          const author =
            deck.author?.displayName?.trim() ||
            deck.author?.username?.trim() ||
            placement.player;

          return (
            <article
              key={`${placement.place}-${deck.identifier}`}
              className="space-y-3 pt-2"
            >
              <header
                className="
                  space-y-1.5
                "
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`
                      flex
                      h-6
                      w-6
                      shrink-0
                      items-center
                      justify-center
                      rounded
                      border
                      text-[10px]
                      font-black
                      tabular-nums
                      ${
                        RANK_STYLES[placement.place] ??
                        "border-slate-700 bg-slate-800/80 text-slate-400"
                      }
                    `}
                  >
                    {placement.place}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-black text-white">
                      {placement.player}
                    </p>

                    <p
                      className="
                        truncate
                        text-[8px]
                        font-bold
                        uppercase
                        tracking-[0.12em]
                        text-slate-500
                      "
                    >
                      {placement.archetype}
                      {author !== placement.player
                        ? ` · ${author}`
                        : ""}
                    </p>
                  </div>

                  <Link
                    href={deckIdentifierHref(
                      deck.slug,
                      deck.identifier
                    )}
                    aria-label={`Open ${placement.player}'s deck list`}
                    className="
                      inline-flex
                      h-7
                      shrink-0
                      items-center
                      gap-1
                      rounded-md
                      border
                      border-blue-500/30
                      bg-blue-500/10
                      px-1.5
                      text-[8px]
                      font-black
                      uppercase
                      tracking-[0.1em]
                      text-blue-200
                      transition-colors
                      hover:border-blue-400/70
                      hover:text-white
                    "
                  >
                    Open
                    <ArrowUpRight className="h-2.5 w-2.5" />
                  </Link>
                </div>

                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 shrink-0 text-amber-300" />

                  <span
                    className="
                      truncate
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-amber-200
                    "
                    title={deck.skill ?? "No Skill"}
                  >
                    {deck.skill?.trim() || "No Skill"}
                  </span>
                </div>
              </header>

              <div className="py-1">
                <DeckMainDeck deck={deck} />

                <DeckExtraDeck deck={deck} />
              </div>

              <footer
                className="
                  flex
                  flex-col
                  items-start
                  gap-3
                "
              >
                <span
                  className="
                    inline-flex
                    items-center
                    gap-1
                    text-[8px]
                    font-black
                    uppercase
                    tracking-[0.12em]
                    text-slate-500
                  "
                >
                  <Layers className="h-3 w-3" />
                  {deck.mainCards ?? 0} main ·{" "}
                  {deck.extraCards ?? 0} extra
                </span>

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

function deckIdentifierHref(
  slug: string,
  identifier: string
) {
  return `/decks/${slug}/${identifier}`;
}
