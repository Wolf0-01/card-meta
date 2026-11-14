import type { Metadata } from "next";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  Layers,
  LayoutGrid,
  Search,
} from "lucide-react";

import DeckArchetypeCard from "@/components/decks/DeckArchetypeCard";

import DeckExplorerControls from "@/components/decks/DeckExplorerControls";

import PublicDeckCard from "@/components/decks/PublicDeckCard";

import {
  findPublicDeckArchetypeGroups,
  findPublicDeckExplorer,
} from "@/services/decks";

export const metadata: Metadata = {
  title: "Top Decks | Card Meta",

  description:
    "Explora los mazos públicos de Yu-Gi-Oh! Duel Links agrupados por arquetipo, con búsqueda y filtro por Skill.",
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

  const [result, archetypes] =
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
            href="/"
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
            Inicio
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
            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.24em]
                text-blue-300
              "
            >
              Card Meta · Duel Links
            </p>

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
              Top Decks:{" "}
              {format === "rush" ? "Rush" : "Speed"}
            </h1>

            <p
              className="
                max-w-xl
                text-[11px]
                leading-relaxed
                text-slate-400
              "
            >
              Mazos públicos de la comunidad de{" "}
              {format === "rush"
                ? "Rush Duel"
                : "Speed Duel"}
              , agrupados por arquetipo.
            </p>
          </div>
        </header>

        <DeckExplorerControls
          initialSearch={search}
          initialSkill={skill}
          initialFormat={format}
          skills={result.skills}
          total={result.total}
        />

        {archetypes.length > 0 && (
          <section
            aria-label="Arquetipos con mazos públicos"
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
                  Arquetipos
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
                  ? "arquetipo"
                  : "arquetipos"}{" "}
                ·{" "}
                <span className="tabular-nums text-slate-300">
                  {formatDeckTotal}
                </span>{" "}
                {formatDeckTotal === 1
                  ? "mazo"
                  : "mazos"}
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
              {archetype
                ? `Mazos de ${archetype}`
                : search
                  ? `Resultados para "${search}"`
                  : "Mazos públicos"}
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
              ? "mazo"
              : "mazos"}
          </span>
        </div>

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
                ? "Ningún mazo coincide con estos filtros."
                : format === "rush"
                  ? "Todavía no hay mazos Rush públicos."
                  : "Todavía no hay mazos públicos."}
            </p>

            <p className="max-w-sm text-xs text-slate-500">
              {hasFilters
                ? "Prueba con otro arquetipo, nombre o Skill."
                : format === "rush"
                  ? "Publica el primer mazo Rush de la comunidad."
                  : "Publica tu primer mazo para que aparezca aquí."}
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
                ? "Reiniciar filtros"
                : "Crear un mazo"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </section>
        ) : (
          <section
            aria-label="Mazos públicos"
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
            aria-label="Paginación de mazos"
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
                Anterior
              </Link>
            ) : (
              <span className="opacity-40">
                Anterior
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
                Siguiente
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span className="opacity-40">
                Siguiente
              </span>
            )}
          </nav>
        )}
      </div>
    </main>
  );
}
