"use client";

import DeckActions from "./DeckActions";
import DeckArchetypeBanner from "./DeckArchetypeBanner";
import DeckCombos from "./DeckCombos";
import DeckCreatorCard, {
  formatDeckDate,
} from "./DeckCreatorCard";
import DeckExtraDeck from "./DeckExtraDeck";
import DeckGemBreakdown from "./DeckGemBreakdown";
import DeckGuide from "./DeckGuide";
import DeckMainDeck from "./DeckMainDeck";
import DeckMatchups from "./DeckMatchups";
import RelatedDecks from "./RelatedDecks";
import SkillHoverCard from "./SkillHoverCard";

import { getDeckArchetypeLabel } from "@/lib/decks/archetypeLabel";

import { getDuelFormatLabel } from "@/lib/duelFormat";

import type { DeckGemEstimate } from "@/lib/decks/gemCalculator";

import type { MetaDeck } from "@/types/meta";

interface Props {
  deck: MetaDeck;

  gemEstimate: DeckGemEstimate;

  relatedDecks?: MetaDeck[];
}

function countQuantity(
  cards: MetaDeck["cards"]
) {
  return cards.reduce(
    (total, deckCard) =>
      total + (deckCard.quantity ?? 1),
    0
  );
}

export default function DeckViewer({
  deck,
  gemEstimate,
  relatedDecks = [],
}: Props) {
  const cards = deck.cards ?? [];

  const mainDeck = cards.filter(
    (deckCard) =>
      deckCard.zone === "main"
  );

  const extraDeck = cards.filter(
    (deckCard) =>
      deckCard.zone === "extra"
  );

  const mainCount =
    deck.mainCards ?? countQuantity(mainDeck);

  const extraCount =
    deck.extraCards ?? countQuantity(extraDeck);

  const totalCards =
    deck.totalCards ?? countQuantity(cards);

  const author = deck.author ?? null;

  const authorName =
    author?.displayName?.trim() ||
    author?.username ||
    "Anonymous creator";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header
        className="
          flex
          flex-col
          items-center
          gap-1
          border-b
          border-border
          pb-5
          text-center
        "
      >
        <p
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-[0.22em]
            text-primary
          "
        >
          Published deck
        </p>

        <h1
          className="
            text-2xl
            font-black
            uppercase
            tracking-wide
            text-foreground
            sm:text-3xl
          "
        >
          {deck.name}
        </h1>

        <p
          className="
            text-sm
            text-foreground-muted
          "
        >
          {getDeckArchetypeLabel(deck)}{" "}
          · {getDuelFormatLabel(deck.format)}
        </p>

        <p
          className="
            text-xs
            text-foreground-muted
          "
        >
          from{" "}
          <span className="font-semibold text-foreground-secondary">
            {authorName}
          </span>{" "}
          on {formatDeckDate(deck.createdAt)}
        </p>
      </header>

      <div
        className="
          grid
          gap-5
          lg:grid-cols-[418px_320px]
          lg:items-start
          lg:justify-center
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-[418px]
            space-y-3
          "
        >
          <section
            className="
              rounded-2xl
              border
              border-border
              bg-background-secondary
              p-3
              sm:p-4
            "
          >
            <SkillHoverCard
              skillName={deck.skill ?? ""}
              cards={mainDeck}
              className="
                mb-3
                flex
                items-center
                justify-between
                gap-3
                border-b
                border-border
                pb-3
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

                <span
                  className="
                    shrink-0
                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.16em]
                    text-foreground-muted
                  "
                >
                  Skill
                </span>

                <span className="truncate text-xs font-semibold text-foreground">
                  {deck.skill?.trim() ||
                    "No skill"}
                </span>
              </div>

              <span
                className="
                  shrink-0
                  text-xs
                  font-black
                  tabular-nums
                  text-foreground
                "
              >
                {mainCount} cards
              </span>
            </SkillHoverCard>

            <DeckMainDeck deck={deck} />

            <div className="mt-5">
              <DeckExtraDeck deck={deck} />
            </div>

            <footer
              className="
                mt-4
                flex
                flex-wrap
                items-center
                justify-between
                gap-2
                border-t
                border-border
                pt-3
                text-[10px]
                font-semibold
                uppercase
                tracking-wide
                text-foreground-muted
              "
            >
              <span>
                {mainCount} main · {extraCount} extra
              </span>

              <span>{totalCards} total</span>
            </footer>
          </section>

          <DeckActions deck={deck} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6">
          <DeckArchetypeBanner deck={deck} />

          <DeckCreatorCard deck={deck} />

          <DeckGemBreakdown
            estimate={gemEstimate}
          />
        </aside>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DeckGuide guide={deck.guide} />

        <div className="space-y-4">
          <DeckCombos
            combos={
              deck.combos
                ? [deck.combos]
                : null
            }
          />

          <DeckMatchups matchups={[]} />
        </div>
      </div>

      <RelatedDecks decks={relatedDecks} />
    </div>
  );
}
