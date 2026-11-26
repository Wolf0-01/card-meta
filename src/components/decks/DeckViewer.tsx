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

import SkillLink from "@/components/skills/SkillLink";

import {
  getDeckArchetypeLabel,
  getDeckArchetypeSlug,
} from "@/lib/decks/archetypeLabel";

import { getDuelFormatLabel } from "@/lib/duelFormat";

import type { DeckGemEstimate } from "@/lib/decks/gemCalculator";

import type { MetaDeck } from "@/types/meta";

import type { SkillMetaSummary } from "@/types/skill";

interface Props {
  deck: MetaDeck;

  gemEstimate: DeckGemEstimate;

  relatedDecks?: MetaDeck[];

  breakdownHref?: string;

  canViewPlayerProfile?: boolean;

  isOwner?: boolean;

  skillMeta?: SkillMetaSummary | null;

  tournamentInfo?: {
    name: string;
    slug: string;
    placement?: string | null;
  } | null;

  prevDeckHref?: string | null;

  nextDeckHref?: string | null;
}

function countQuantity(cards: MetaDeck["cards"]) {
  return cards.reduce(
    (total, deckCard) => total + (deckCard.quantity ?? 1),
    0
  );
}

function formatPlacementText(raw?: string | null): string {
  if (!raw) return "Top Cut";
  const clean = raw.trim();
  if (clean === "1" || clean.toLowerCase() === "1st") return "1st Place";
  if (clean === "2" || clean.toLowerCase() === "2nd") return "2nd Place";
  if (clean === "3" || clean.toLowerCase() === "3rd") return "3rd Place";
  if (/^\d+$/.test(clean)) return `Top ${clean}`;
  return clean;
}

export default function DeckViewer({
  deck,
  gemEstimate,
  relatedDecks = [],
  breakdownHref,
  canViewPlayerProfile = false,
  isOwner = false,
  skillMeta = null,
  tournamentInfo = null,
  prevDeckHref = null,
  nextDeckHref = null,
}: Props) {
  const cards = deck.cards ?? [];

  const mainDeck = cards.filter((deckCard) => deckCard.zone === "main");

  const extraDeck = cards.filter((deckCard) => deckCard.zone === "extra");

  const mainCount = deck.mainCards ?? countQuantity(mainDeck);

  const extraCount = deck.extraCards ?? countQuantity(extraDeck);

  const totalCards = deck.totalCards ?? countQuantity(cards);

  const author = deck.author ?? null;

  const authorName =
    author?.displayName?.trim() ||
    author?.username ||
    "Anonymous creator";

  const customPlayerName = deck.playerName?.trim() || null;

  const resolvedBreakdownHref =
    breakdownHref ??
    `/decks/breakdown/${getDeckArchetypeSlug(deck)}${
      deck.format === "rush" ? "?format=rush" : ""
    }`;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="border-b border-border pb-5">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Botón Previous (izquierda) */}
          <div className="order-2 flex w-full justify-between sm:order-1 sm:w-auto">
            {prevDeckHref ? (
              <Link
                href={prevDeckHref}
                className="inline-flex min-w-[138px] items-center justify-center gap-2 rounded-md border border-slate-700/80 bg-[#08152E] px-5 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:border-sky-500/60 hover:bg-[#0D2147] hover:text-white"
              >
                <span aria-hidden="true" className="text-[10px]">
                  ◀
                </span>
                <span>Previous</span>
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex min-w-[138px] cursor-not-allowed items-center justify-center gap-2 rounded-md border border-slate-800/80 bg-[#071124]/60 px-5 py-2.5 text-xs font-semibold text-slate-600"
              >
                <span aria-hidden="true" className="text-[10px]">
                  ◀
                </span>
                <span>Previous</span>
              </span>
            )}

            {/* Botón Next en móvil */}
            {nextDeckHref ? (
              <Link
                href={nextDeckHref}
                className="inline-flex min-w-[138px] items-center justify-center gap-2 rounded-md border border-sky-400/40 bg-[#1D568E] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#2569AC] sm:hidden"
              >
                <span>Next</span>
                <span aria-hidden="true" className="text-[10px]">
                  ▶
                </span>
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex min-w-[138px] cursor-not-allowed items-center justify-center gap-2 rounded-md border border-slate-800/80 bg-[#071124]/60 px-5 py-2.5 text-xs font-semibold text-slate-600 sm:hidden"
              >
                <span>Next</span>
                <span aria-hidden="true" className="text-[10px]">
                  ▶
                </span>
              </span>
            )}
          </div>

          {/* Bloque central: Nombre del mazo + Puesto/Torneo + Autor */}
          <div className="order-1 flex flex-col items-center gap-1 text-center sm:order-2">
            <h1 className="text-2xl font-black uppercase tracking-wide text-foreground sm:text-3xl">
              {deck.name}
            </h1>

            {tournamentInfo ? (
              <p className="text-base font-medium text-foreground-secondary sm:text-lg">
                {formatPlacementText(
                  tournamentInfo.placement ?? deck.placement
                )}{" "}
                in{" "}
                <Link
                  href={`/tournaments/${tournamentInfo.slug}`}
                  className="font-semibold text-sky-400 transition-colors hover:text-sky-300 hover:underline"
                >
                  {tournamentInfo.name}
                </Link>
              </p>
            ) : deck.achievement === "KOG" ? (
              <p className="text-base font-medium text-foreground-secondary sm:text-lg">
                King of Games
              </p>
            ) : deck.achievement === "KC_MAX" ? (
              <p className="text-base font-medium text-foreground-secondary sm:text-lg">
                {deck.placement
                  ? `KC Cup · ${deck.placement}`
                  : "KC Cup · DLv. MAX"}
              </p>
            ) : deck.achievement === "TOURNAMENT" ? (
              <p className="text-base font-medium text-foreground-secondary sm:text-lg">
                {deck.placement
                  ? `${formatPlacementText(deck.placement)} · Tournament`
                  : "Tournament Top"}
              </p>
            ) : (
              <p className="text-sm text-foreground-muted">
                {getDeckArchetypeLabel(deck)} ·{" "}
                {getDuelFormatLabel(deck.format)}
              </p>
            )}

            {deck.noLimits && (
              <span className="rounded border border-amber-400/40 bg-amber-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-300">
                No Limits · Banlist ignored
              </span>
            )}

            <p className="text-xs text-foreground-muted">
              from{" "}
              {customPlayerName ? (
                <span className="font-semibold text-foreground-secondary">
                  {customPlayerName}
                </span>
              ) : canViewPlayerProfile && author?.username ? (
                <Link
                  href={`/user/${author.username}`}
                  className="font-semibold text-foreground-secondary transition-colors hover:text-primary"
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
          </div>

          {/* Botón Next (derecha en escritorio) */}
          <div className="order-3 hidden sm:block">
            {nextDeckHref ? (
              <Link
                href={nextDeckHref}
                className="inline-flex min-w-[138px] items-center justify-center gap-2 rounded-md border border-sky-400/40 bg-[#1D568E] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#2569AC]"
              >
                <span>Next</span>
                <span aria-hidden="true" className="text-[10px]">
                  ▶
                </span>
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex min-w-[138px] cursor-not-allowed items-center justify-center gap-2 rounded-md border border-slate-800/80 bg-[#071124]/60 px-5 py-2.5 text-xs font-semibold text-slate-600"
              >
                <span>Next</span>
                <span aria-hidden="true" className="text-[10px]">
                  ▶
                </span>
              </span>
            )}
          </div>
        </div>
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

                <SkillLink
                  name={deck.skill?.trim() ?? ""}
                  meta={skillMeta}
                  className="
                    text-xs
                    font-semibold
                    text-foreground
                  "
                />
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
