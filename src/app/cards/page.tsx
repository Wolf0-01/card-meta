import type { Metadata } from "next";

import Link from "next/link";

import {
  Search,
} from "lucide-react";

import CardCatalogControls from "@/components/cards/CardCatalogControls";

import CatalogGrid from "@/components/cards/CatalogGrid";

import CatalogHeader from "@/components/cards/CatalogHeader";

import CardsPagination from "@/components/cards/CardsPagination";

import SkillsCatalogControls from "@/components/cards/skills/SkillsCatalogControls";

import SkillsGrid from "@/components/cards/skills/SkillsGrid";

import {
  isCatalogTab,
  type CatalogTab,
} from "@/components/cards/catalogTabs";

import { queryCards } from "@/lib/queryCards";

import { querySkills } from "@/lib/skills/search";

export const metadata: Metadata = {
  title: "Catálogo de cartas | Card Meta",

  description:
    "Explora el catálogo completo de Yu-Gi-Oh! Duel Links con búsqueda, filtros y vista detallada.",
};

interface CardsPageProps {
  searchParams: Promise<{
    tab?: string;
    page?: string;
    search?: string;
    character?: string;
    type?: string;
    attribute?: string;
    rarity?: string;
    level?: string;
    monsterType?: string;
    archetype?: string;
    scale?: string;
    minAtk?: string;
    maxAtk?: string;
    minDef?: string;
    maxDef?: string;
    sort?: string;
    direction?: string;
    mode?: string;
  }>;
}

function toNumber(
  value?: string
): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : undefined;
}

export default async function CardsPage({
  searchParams,
}: CardsPageProps) {
  const params = await searchParams;

  const activeTab: CatalogTab =
    isCatalogTab(params.tab)
      ? params.tab
      : "cards";

  const page = Math.max(
    toNumber(params.page) ?? 1,
    1
  );

  const direction =
    params.direction === "desc"
      ? "desc"
      : "asc";

  const result =
    activeTab === "cards"
      ? await queryCards({
          search: params.search,

          type: params.type,

          attribute: params.attribute,

          rarity: params.rarity,

          monsterType: params.monsterType,

          archetype: params.archetype,

          level: toNumber(params.level),

          scale: toNumber(params.scale),

          minAttack: toNumber(params.minAtk),

          maxAttack: toNumber(params.maxAtk),

          minDefense: toNumber(params.minDef),

          maxDefense: toNumber(params.maxDef),

          sort: params.sort,

          direction,

          page,

          limit: 50,
        })
      : null;

  const skillsResult =
    activeTab === "skills"
      ? querySkills({
          search: params.search,

          character: params.character,

          page,

          limit: 18,
        })
      : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Catálogo de cartas"
      className="
        fixed
        inset-0
        z-[80]
        flex
        items-center
        justify-center
        overflow-hidden
        bg-[#050914]/80
        p-3
        text-slate-100
        backdrop-blur-md
        sm:p-6
      "
    >
      <div
        aria-hidden
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_50%_-10%,rgba(37,99,235,0.18),transparent_55%),radial-gradient(circle_at_90%_90%,rgba(14,165,233,0.08),transparent_45%)]
        "
      />

      <section
        className="
          relative
          flex
          h-[85vh]
          max-h-[85vh]
          w-full
          max-w-[540px]
          flex-col
          overflow-hidden
          rounded-xl
          border
          border-slate-700/70
          bg-[#0B132B]
          shadow-[0_30px_90px_-20px_rgba(0,0,0,0.95)]
          ring-1
          ring-white/5
        "
      >
        <CatalogHeader
          activeTab={activeTab}
        />

        {activeTab === "cards" &&
        result ? (
          <>
            <CardCatalogControls />

            <div
              className="
                min-h-0
                flex-1
                overflow-y-auto
                overscroll-contain
                px-2.5
                py-2
                sm:px-3
              "
            >
              {result.cards.length === 0 ? (
                <div
                  className="
                    flex
                    min-h-[200px]
                    flex-col
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    border
                    border-dashed
                    border-slate-700
                    px-6
                    text-center
                    text-[11px]
                    text-slate-400
                  "
                >
                  <Search className="h-6 w-6 text-slate-600" />

                  <p>
                    No se encontraron cartas
                    con estos filtros.
                  </p>

                  <Link
                    href="/cards"
                    className="
                      mt-1
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.14em]
                      text-blue-300
                      transition-colors
                      hover:text-blue-200
                    "
                  >
                    Reiniciar filtros
                  </Link>
                </div>
              ) : (
                <CatalogGrid
                  cards={result.cards}
                />
              )}
            </div>

            <footer
              className="
                shrink-0
                border-t
                border-slate-700/60
                bg-[#0B132B]/95
                px-3
                py-2
                sm:px-4
              "
            >
              <CardsPagination
                currentPage={result.page}
                totalPages={result.pages}
                total={result.total}
              />
            </footer>
          </>
        ) : activeTab === "skills" &&
          skillsResult ? (
          <>
            <SkillsCatalogControls
              characters={skillsResult.characters}
            />

            <div
              className="
                min-h-0
                flex-1
                overflow-y-auto
                overscroll-contain
                px-2.5
                py-2
                sm:px-3
              "
            >
              {skillsResult.skills.length === 0 ? (
                <div
                  className="
                    flex
                    min-h-[200px]
                    flex-col
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    border
                    border-dashed
                    border-slate-700
                    px-6
                    text-center
                    text-[11px]
                    text-slate-400
                  "
                >
                  <Search className="h-6 w-6 text-slate-600" />

                  <p>
                    No se encontraron habilidades
                    con estos filtros.
                  </p>

                  <Link
                    href="/cards?tab=skills"
                    className="
                      mt-1
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.14em]
                      text-blue-300
                      transition-colors
                      hover:text-blue-200
                    "
                  >
                    Reiniciar filtros
                  </Link>
                </div>
              ) : (
                <SkillsGrid
                  skills={skillsResult.skills}
                />
              )}
            </div>

            <footer
              className="
                shrink-0
                border-t
                border-slate-700/60
                bg-[#0B132B]/95
                px-3
                py-2
                sm:px-4
              "
            >
              <CardsPagination
                currentPage={skillsResult.page}
                totalPages={skillsResult.pages}
                total={skillsResult.total}
                itemLabel="skills"
              />
            </footer>
          </>
        ) : (
          <div
            className="
              flex
              flex-1
              flex-col
              items-center
              justify-center
              gap-2
              px-6
              text-center
            "
          >
            <p
              className="
                text-sm
                font-black
                uppercase
                tracking-[0.22em]
                text-slate-300
              "
            >
              {activeTab}
            </p>

            <p className="max-w-sm text-xs text-slate-500">
              Esta sección estará disponible
              próximamente en el catálogo.
            </p>

            <Link
              href="/cards"
              className="
                mt-2
                text-[10px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-blue-300
                transition-colors
                hover:text-blue-200
              "
            >
              Volver a Cards
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
