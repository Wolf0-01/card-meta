import type { Metadata } from "next";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  Layers,
  LayoutGrid,
  Search,
} from "lucide-react";

import ArchetypeDeckTable, {
  type ArchetypeDeckRow,
} from "@/components/decks/ArchetypeDeckTable";

import CompetitiveReviewQueue from "@/components/decks/CompetitiveReviewQueue";

import DeckArchetypeCard from "@/components/decks/DeckArchetypeCard";

import DeckExplorerControls from "@/components/decks/DeckExplorerControls";

import PublicDeckCard from "@/components/decks/PublicDeckCard";

import { getCurrentUser } from "@/lib/auth/currentUser";

import { canManageGuides } from "@/lib/auth/roles";

import {
  normalizeAchievement,
  normalizePlacement,
} from "@/lib/decks/achievements";

import {
  findPendingCompetitiveResults,
  findPublicDeckArchetypeGroups,
  findPublicDeckExplorer,
} from "@/services/decks";

export const metadata: Metadata = {
  title: "Top Decks | Card Meta",

  description:
    "Explore public Yu-Gi-Oh! Duel Links decks grouped by archetype, with search and Skill filters.",
};

interface DecksPageProps {
  searchParams: Promise<{
    search?: string;
    /** Alias usado por la Tier List para abrir un arquetipo. */
    q?: string;
    skill?: string;
    format?: string;
    archetype?: string;
    page?: string;
  }>;
}

function buildPageHref(
  base: {
    search?: string;
    skill?: string;
    archetype?: string;
    format?: string;
  },
  page: number
): string {
  const params = new URLSearchParams();

  if (base.search) {
    params.set("search", base.search);
  }

  if (base.skill) {
    params.set("skill", base.skill);
  }

  if (base.archetype) {
    params.set("archetype", base.archetype);
  }

  if (base.format === "rush") {
    params.set("format", "rush");
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();

  return query ? `/decks?${query}` : "/decks";
}

export default async function DecksPage({
  searchParams,
}: DecksPageProps) {
  const params = await searchParams;

  const search = (
    params.q ??
    params.search ??
    ""
  ).trim();

  const skill = params.skill?.trim() ?? "";

  const archetype =
    params.archetype?.trim() ?? "";

  const format =
    params.format === "rush"
      ? "rush"
      : "speed";

  const parsedPage = Number(params.page);

  const page =
    Number.isFinite(parsedPage) && parsedPage > 0
      ? Math.floor(parsedPage)
      : 1;

  const user = await getCurrentUser();

  const isStaff = canManageGuides(user);

  const [result, archetypes, pendingResults] =
    await Promise.all([
      findPublicDeckExplorer({
        search,
        skill,
        format,
        archetype,
        page,
        pageSize: 24,
      }),

      findPublicDeckArchetypeGroups(format),

      isStaff
        ? findPendingCompetitiveResults()
        : Promise.resolve([]),
    ]);

  const hasFilters =
    search.length > 0 ||
    skill.length > 0 ||
    archetype.length > 0;

  const formatSuffix =
    format === "rush" ? "?format=rush" : "";

  const resetHref = `/decks${formatSuffix}`;

  const formatDeckTotal = archetypes.reduce(
    (total, group) => total + group.count,
    0
  );

  const deckRows: ArchetypeDeckRow[] =
    result.items.map((deck) => ({
      id: deck.id,

      href: `/decks/${deck.slug}/${deck.identifier}`,

      skill: deck.skill ?? null,

      notes: deck.notes ?? null,

      achievement: normalizeAchievement(
        deck.achievement
      ),

      placement: normalizePlacement(
        deck.placement
      ),

      verified: deck.verified === true,

      playerUsername:
        deck.author?.username ?? null,

      playerName:
        deck.author?.displayName ??
        deck.author?.username ??
        null,

      cardIds: deck.cards.map(
        (deckCard) => deckCard.card.id
      ),

      createdAt: deck.createdAt,
    }));

  function buildArchetypeHref(
    name: string
  ): string {
    const next = new URLSearchParams();

    if (format === "rush") {
      next.set("format", "rush");
    }

    if (
      name.toLowerCase() !==
      archetype.toLowerCase()
    ) {
      next.set("archetype", name);
    }

    const query = next.toString();

    return query ? `/decks?${query}` : "/decks";
  }

  return (
    <main
      className="
        min-h-screen
        bg-[#070D1F]
        px-3
        py-5
        text-slate-100
        sm:px-6
        sm:py-7
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-6xl
          space-y-4
        "
      >
        <header className="space-y-2">
          <Link
            href={archetype ? resetHref : "/"}
            className="
              inline-flex
              items-center
              gap-1
              text-[9px]
              font-black
              uppercase
              tracking-[0.18em]
              text-slate-500
              transition-colors
              hover:text-blue-300
            "
          >
            <ArrowLeft className="h-3 w-3" />
            {archetype ? "All Archetypes" : "Home"}
          </Link>

          <div
            className="
              flex
              flex-col
              items-center
              gap-1.5
              text-center
            "
          >
            <h1
              className="
                text-2xl
                font-black
                uppercase
                tracking-tight
                text-white
                sm:text-3xl
              "
            >
              {archetype
                ? archetype
                : `Top Decks: ${
                    format === "rush"
                      ? "Rush"
                      : "Speed"
                  }`}
            </h1>

            {!archetype && (
              <p
                className="
                  max-w-xl
                  text-[11px]
                  leading-relaxed
                  text-slate-400
                "
              >
                {`Public community decks for ${
                  format === "rush"
                    ? "Rush Duel"
                    : "Speed Duel"
                }, grouped by archetype.`}
              </p>
            )}
          </div>
        </header>

        <DeckExplorerControls
          initialSearch={search}
          initialSkill={skill}
          initialFormat={format}
          skills={result.skills}
          total={result.total}
        />

        {isStaff && pendingResults.length > 0 && (
          <CompetitiveReviewQueue
            results={pendingResults}
          />
        )}

        {!archetype && archetypes.length > 0 && (
          <section
            aria-label="Archetypes with public decks"
            className="space-y-2"
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
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-blue-300" />

                <h2
                  className="
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.2em]
                    text-slate-300
                  "
                >
                  Archetypes
                </h2>
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
                {archetypes.length}{" "}
                {archetypes.length === 1
                  ? "archetype"
                  : "archetypes"}{" "}
                ·{" "}
                <span className="tabular-nums text-slate-300">
                  {formatDeckTotal}
                </span>{" "}
                {formatDeckTotal === 1
                  ? "deck"
                  : "decks"}
              </span>
            </div>

            <div
              className="
                grid
                grid-cols-1
                gap-2.5
                sm:grid-cols-2
                lg:grid-cols-4
              "
            >
              {archetypes.map((group) => (
                <DeckArchetypeCard
                  key={group.name}
                  name={group.name}
                  count={group.count}
                  image={group.image}
                  tier={group.tier}
                  href={buildArchetypeHref(
                    group.name
                  )}
                  active={
                    group.name.toLowerCase() ===
                    archetype.toLowerCase()
                  }
                />
              ))}
            </div>
          </section>
        )}

        {hasFilters && (
          <>
            {!archetype && (
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
                  <LayoutGrid className="h-3.5 w-3.5 shrink-0 text-blue-300" />
      
                  <h2
                    className="
                      truncate
                      text-[10px]
                      font-black
                      uppercase
                      tracking-[0.2em]
                      text-slate-300
                    "
                  >
                    {search
                      ? `Results for "${search}"`
                      : "Public decks"}
                  </h2>
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
                    {result.total}
                  </span>{" "}
                  {result.total === 1
                    ? "deck"
                    : "decks"}
                </span>
              </div>
            )}
    
            {result.items.length === 0 ? (
              <section
                className="
                  flex
                  flex-col
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-dashed
                  border-slate-700
                  bg-[#0B132B]/60
                  px-6
                  py-14
                  text-center
                "
              >
                <Search className="h-7 w-7 text-slate-600" />
    
                <p className="text-sm font-bold text-slate-300">
                  {hasFilters
                    ? "No deck matches these filters."
                    : format === "rush"
                      ? "No public Rush decks yet."
                      : "No public decks yet."}
                </p>
    
                <p className="max-w-sm text-xs text-slate-500">
                  {hasFilters
                    ? "Try another archetype, name or Skill."
                    : format === "rush"
                      ? "Publish the community's first Rush deck."
                      : "Publish your first deck so it shows up here."}
                </p>
    
                <Link
                  href={
                    hasFilters
                      ? resetHref
                      : `/decks/new${formatSuffix}`
                  }
                  className="
                    mt-2
                    inline-flex
                    items-center
                    gap-1
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.14em]
                    text-blue-300
                    transition-colors
                    hover:text-blue-200
                  "
                >
                  {hasFilters
                    ? "Reset filters"
                    : "Create a deck"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </section>
            ) : archetype ? (
              <ArchetypeDeckTable
                rows={deckRows}
                canViewPlayerProfile={isStaff}
              />
            ) : (
              <section
                aria-label="Public decks"
                className="
                  grid
                  grid-cols-1
                  gap-2.5
                  md:grid-cols-2
                  xl:grid-cols-3
                "
              >
                {result.items.map((deck) => (
                  <PublicDeckCard
                    key={deck.identifier}
                    deck={deck}
                  />
                ))}
              </section>
            )}
    
            {result.totalPages > 1 && (
              <nav
                aria-label="Deck pagination"
                className="
                  flex
                  items-center
                  justify-between
                  gap-2
                  border-t
                  border-slate-800
                  pt-3
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.14em]
                  text-slate-500
                "
              >
                {result.page > 1 ? (
                  <Link
                    href={buildPageHref(
                      {
                        search,
                        skill,
                        archetype,
                        format,
                      },
                      result.page - 1
                    )}
                    className="
                      inline-flex
                      items-center
                      gap-1
                      text-slate-300
                      transition-colors
                      hover:text-blue-200
                    "
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Previous
                  </Link>
                ) : (
                  <span className="opacity-40">
                    Previous
                  </span>
                )}
    
                <span className="tabular-nums">
                  {result.page} / {result.totalPages}
                </span>
    
                {result.page < result.totalPages ? (
                  <Link
                    href={buildPageHref(
                      {
                        search,
                        skill,
                        archetype,
                        format,
                      },
                      result.page + 1
                    )}
                    className="
                      inline-flex
                      items-center
                      gap-1
                      text-slate-300
                      transition-colors
                      hover:text-blue-200
                    "
                  >
                    Next
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <span className="opacity-40">
                    Next
                  </span>
                )}
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  );
}
