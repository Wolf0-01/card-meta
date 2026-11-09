"use client";

import DeckActions from "./DeckActions";
import DeckArchetypeBanner from "./DeckArchetypeBanner";
import DeckCardItem from "./DeckCardItem";
import DeckCombos from "./DeckCombos";
import DeckCreatorCard from "./DeckCreatorCard";
import DeckExtraDeck from "./DeckExtraDeck";
import DeckGuide from "./DeckGuide";
import DeckMainDeck from "./DeckMainDeck";
import DeckMatchups from "./DeckMatchups";
import RelatedDecks from "./RelatedDecks";

import {
  estimateDeckGemCost,
} from "@/lib/decks/gemCost";

import { getDeckArchetypeLabel } from "@/lib/decks/archetypeLabel";

import type { MetaDeck } from "@/types/meta";

interface Props {
  deck: MetaDeck;

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

  const sideDeck = cards.filter(
    (deckCard) =>
      deckCard.zone === "side"
  );

  const mainCount =
    deck.mainCards ?? countQuantity(mainDeck);

  const extraCount =
    deck.extraCards ?? countQuantity(extraDeck);

  const sideCount =
    deck.sideCards ?? countQuantity(sideDeck);

  const totalCards =
    deck.totalCards ?? countQuantity(cards);

  const gemCost = estimateDeckGemCost(deck);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header
        className="
          flex
          flex-col
          gap-3
          border-b
          border-border
          pb-4
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <div className="min-w-0">
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.22em]
              text-primary
            "
          >
            Mazo publicado
          </p>

          <h1
            className="
              truncate
              text-2xl
              font-black
              text-foreground
              sm:text-3xl
            "
          >
            {deck.name}
          </h1>

          <p
            className="
              mt-1
              text-sm
              text-foreground-muted
            "
          >
            {getDeckArchetypeLabel(deck)}{" "}
            · {deck.format ?? "Advanced"}
          </p>
        </div>

        <DeckActions deck={deck} />
      </header>

      <div
        className="
          grid
          gap-5
          lg:grid-cols-[minmax(0,1fr)_320px]
          lg:items-start
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
          <div
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
                  "Sin skill"}
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
          </div>

          <DeckMainDeck deck={deck} />

          <div className="mt-5">
            <DeckExtraDeck deck={deck} />
          </div>

          {sideDeck.length > 0 && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <h2
                  className="
                    text-[11px]
                    font-black
                    uppercase
                    tracking-[0.16em]
                    text-foreground-muted
                  "
                >
                  Side Deck ({sideCount})
                </h2>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {sideDeck.map((deckCard) => (
                  <DeckCardItem
                    key={deckCard.id}
                    card={deckCard.card}
                    quantity={
                      deckCard.quantity
                    }
                    compact
                  />
                ))}
              </div>
            </div>
          )}

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
              {sideCount > 0
                ? ` · ${sideCount} side`
                : ""}
            </span>

            <span>{totalCards} total</span>
          </footer>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-6">
          <DeckArchetypeBanner deck={deck} />

          <DeckCreatorCard
            deck={deck}
            gemCost={gemCost}
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
