"use client";

import Link from "next/link";

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

import {
  getDeckArchetypeLabel,
  getDeckArchetypeSlug,
} from "@/lib/decks/archetypeLabel";

import { getDuelFormatLabel } from "@/lib/duelFormat";

import type { DeckGemEstimate } from "@/lib/decks/gemCalculator";

import type { MetaDeck } from "@/types/meta";

interface Props {
  deck: MetaDeck;

  gemEstimate: DeckGemEstimate;

  relatedDecks?: MetaDeck[];

  /**
   * Destino de la tarjeta lateral del arquetipo: la guía
   * publicada o el explorador filtrado por arquetipo.
   * Si no se indica, se usa el explorador por arquetipo.
   */
  breakdownHref?: string;

  /**
   * Solo ADMIN y EDITOR pueden abrir el perfil público
   * del creador desde la cabecera del mazo.
   */
  canViewPlayerProfile?: boolean;

  /**
   * Muestra el bloque lateral "Deck details" solo al
   * propietario del mazo. Los visitantes no lo ven.
   */
  isOwner?: boolean;
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
  breakdownHref,
  canViewPlayerProfile = false,
  isOwner = false,
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

  const resolvedBreakdownHref =
    breakdownHref ??
    `/decks/breakdown/${getDeckArchetypeSlug(
      deck
    )}${deck.format === "rush" ? "?format=rush" : ""}`;

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
          {canViewPlayerProfile &&
          author?.username ? (
            <Link
              href={`/user/${author.username}`}
              className="
                font-semibold
                text-foreground-secondary
                transition-colors
                hover:text-primary
              "
            >
              {authorName}
            </Link>
          ) : (
            <span className="font-semibold text-foreground-secondary">
              {authorName}
            </span>
          )}{" "}
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

            <DeckExtraDeck deck={deck} />

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
          <DeckArchetypeBanner
            deck={deck}
            href={resolvedBreakdownHref}
          />

          {isOwner && (
            <DeckCreatorCard deck={deck} />
          )}

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
