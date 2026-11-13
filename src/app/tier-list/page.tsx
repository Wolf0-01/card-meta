import type { Metadata } from "next";

import Link from "next/link";

import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Info,
  Layers,
  Rocket,
  type LucideIcon,
} from "lucide-react";

import TierBandSection from "@/components/tier-list/TierBandSection";

import TierListTabs from "@/components/tier-list/TierListTabs";

import {
  formatDate,
  formatNumber,
} from "@/lib/format";

import {
  getTierList,
  type DuelFormat,
} from "@/lib/tier-list";

interface TierListPageProps {
  searchParams: Promise<{
    format?: string;
  }>;
}

function resolveFormat(
  value?: string
): DuelFormat {
  return value === "rush" ? "rush" : "speed";
}

export async function generateMetadata({
  searchParams,
}: TierListPageProps): Promise<Metadata> {
  const params = await searchParams;

  const isRush =
    resolveFormat(params.format) === "rush";

  return {
    title: `${
      isRush ? "Rush" : "Speed"
    } Duel Tier List | Card Meta`,

    description:
      "Tier List competitiva de Yu-Gi-Oh! Duel Links: Tier 1, Tier 2, Tier 3 y High Potential con mazos públicos reales, Power Ranking y acceso directo a sus listas.",
  };
}

interface MetricProps {
  icon: LucideIcon;

  value: string;

  label: string;
}

function Metric({
  icon: Icon,
  value,
  label,
}: MetricProps) {
  return (
    <span
      className="
        inline-flex
        items-center
        gap-1.5
        rounded-md
        border
        border-slate-700/70
        bg-[#070D1F]
        px-2
        py-1
      "
    >
      <Icon className="h-3 w-3 text-blue-300" />

      <span
        className="
          text-xs
          font-black
          tabular-nums
          text-white
        "
      >
        {value}
      </span>

      <span
        className="
          text-[8px]
          font-black
          uppercase
          tracking-[0.14em]
          text-slate-500
        "
      >
        {label}
      </span>
    </span>
  );
}

export default async function TierListPage({
  searchParams,
}: TierListPageProps) {
  const params = await searchParams;

  const format = resolveFormat(params.format);

  const data = await getTierList(format);

  const isRush = format === "rush";

  const title = isRush
    ? "Rush Duel Tier List"
    : "Speed Duel Tier List";

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
        <header className="space-y-3">
          <div
            className="
              flex
              flex-wrap
              items-start
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

              <p
                className="
                  mt-1
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.24em]
                  text-blue-300
                "
              >
                Card Meta · Competitive
              </p>

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
                {title}
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
                El orden competitivo de Duel Links,
                con el rendimiento real de los
                mazos públicos y el pool de cartas
                de cada arquetipo.
              </p>
            </div>

            <div
              className="
                flex
                flex-col
                items-start
                gap-2
                sm:items-end
              "
            >
              <span
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-md
                  border
                  border-slate-700/70
                  bg-[#0B132B]
                  px-2
                  py-1
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-slate-400
                "
              >
                <CalendarDays className="h-3 w-3 text-blue-300" />

                Actualizado{" "}
                {formatDate(data.updatedAt)}
              </span>

              <TierListTabs format={format} />
            </div>
          </div>

          <section
            aria-label="Metodología de la Tier List"
            className="
              rounded-xl
              border
              border-slate-700/60
              bg-[#0B132B]
              p-3
              ring-1
              ring-inset
              ring-white/5
            "
          >
            <div className="flex items-start gap-2.5">
              <span
                aria-hidden
                className="
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-md
                  border
                  border-blue-500/30
                  bg-blue-500/10
                  text-blue-300
                "
              >
                <Info className="h-4 w-4" />
              </span>

              <div className="min-w-0 flex-1">
                <p
                  className="
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.16em]
                    text-slate-300
                  "
                >
                  Metodología
                </p>

                <p
                  className="
                    mt-1
                    max-w-3xl
                    text-[11px]
                    leading-relaxed
                    text-slate-400
                  "
                >
                  La clasificación refleja el
                  rendimiento en torneos y ladder,
                  la popularidad del arquetipo y la
                  profundidad de su pool de cartas.
                  Los contadores de mazos se
                  actualizan automáticamente con las
                  listas públicas de PostgreSQL.
                </p>
              </div>

              <div
                className="
                  hidden
                  shrink-0
                  items-center
                  gap-1.5
                  sm:flex
                "
              >
                <Metric
                  icon={Layers}
                  value={formatNumber(
                    data.totalPublicDecks
                  )}
                  label="mazos"
                />

                <Metric
                  icon={BarChart3}
                  value={String(
                    data.totalArchetypes
                  )}
                  label="arquetipos"
                />
              </div>
            </div>
          </section>
        </header>

        {!data.hasData ? (
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
            <Rocket className="h-8 w-8 text-slate-600" />

            <h2
              className="
                text-sm
                font-black
                uppercase
                tracking-[0.16em]
                text-slate-200
              "
            >
              {format === "rush"
                ? "Todavía no hay datos Rush"
                : "Todavía no hay datos competitivos"}
            </h2>

            <p
              className="
                max-w-md
                text-xs
                leading-relaxed
                text-slate-500
              "
            >
              {format === "rush"
                ? "No hay mazos Rush públicos ni arquetipos Rush en el catálogo. En cuanto existan cartas o listas, aparecerán aquí con su Power Ranking."
                : "Todavía no hay mazos públicos registrados. En cuanto la comunidad publique listas, aparecerán aquí con su Power Ranking y contador automático."}
            </p>

            <Link
              href={
                format === "rush"
                  ? "/decks/new?format=rush"
                  : "/decks/new"
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
              Crear un mazo
            </Link>
          </section>
        ) : (
          <div className="space-y-3">
            {data.bands.map((band) => (
              <TierBandSection
                key={band.key}
                band={band}
                format={format}
              />
            ))}
          </div>
        )}

        <footer
          className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-2
            border-t
            border-slate-800
            pt-3
            text-[9px]
            font-bold
            uppercase
            tracking-[0.14em]
            text-slate-500
          "
        >
          <span>
            Haz clic en un arquetipo para abrir
            sus listas públicas y clonarlas en el
            Deck Builder.
          </span>

          <Link
            href="/decks"
            className="
              text-blue-300
              transition-colors
              hover:text-blue-200
            "
          >
            Explorar todos los mazos
          </Link>
        </footer>
      </div>
    </main>
  );
}
