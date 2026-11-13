import type { Metadata } from "next";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  Layers,
  Search,
} from "lucide-react";

import DeckExplorerControls from "@/components/decks/DeckExplorerControls";

import PublicDeckCard from "@/components/decks/PublicDeckCard";

import { findPublicDeckExplorer } from "@/services/decks";

export const metadata: Metadata = {
  title: "Top Decks: Speed | Card Meta",

  description:
    "Explora los mazos públicos de Yu-Gi-Oh! Duel Links, ordenados por fecha de publicación, con búsqueda y filtro por Skill.",
};

interface DecksPageProps {
  searchParams: Promise<{
    search?: string;
    /** Alias usado por la Tier List para abrir un arquetipo. */
    q?: string;
    skill?: string;
    format?: string;
    page?: string;
  }>;
}

function buildPageHref(
  base: {
    search?: string;
    skill?: string;
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

  const format =
    params.format === "rush"
      ? "rush"
      : "speed";

  const parsedPage = Number(params.page);

  const page =
    Number.isFinite(parsedPage) && parsedPage > 0
      ? Math.floor(parsedPage)
      : 1;

  const result = await findPublicDeckExplorer({
    search,
    skill,
    format,
    page,
    pageSize: 24,
  });

  const hasFilters =
    search.length > 0 || skill.length > 0;

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
        <header
          className="
            flex
            flex-wrap
            items-end
            justify-between
            gap-3
          "
        >
          <div className="min-w-0">
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

            <h1
              className="
                mt-1
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
                mt-1
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
              , ordenados por publicación más
              reciente.
            </p>
          </div>

          <Link
            href="/decks/new"
            className="
              inline-flex
              h-9
              items-center
              gap-1.5
              rounded-lg
              border
              border-blue-500/40
              bg-blue-500/10
              px-3
              text-[10px]
              font-black
              uppercase
              tracking-[0.14em]
              text-blue-200
              transition-colors
              hover:border-blue-400
              hover:bg-blue-500/20
              hover:text-white
            "
          >
            <Layers className="h-3.5 w-3.5" />
            Crear mazo
          </Link>
        </header>

        <DeckExplorerControls
          initialSearch={search}
          initialSkill={skill}
          initialFormat={format}
          skills={result.skills}
          total={result.total}
        />

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
                ? "Prueba con otro nombre, arquetipo o Skill."
                : format === "rush"
                  ? "Publica el primer mazo Rush de la comunidad."
                  : "Publica tu primer mazo para que aparezca aquí."}
            </p>

            <Link
              href={
                hasFilters
                  ? "/decks"
                  : `/decks/new${
                      format === "rush"
                        ? "?format=rush"
                        : ""
                    }`
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
                  { search, skill, format },
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
                  { search, skill, format },
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
