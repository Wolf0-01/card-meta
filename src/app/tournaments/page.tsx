import type { Metadata } from "next";

import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  Database,
  Layers,
  Swords,
  Trophy,
  Users,
} from "lucide-react";

import TournamentResultCard from "@/components/tournaments/TournamentResultCard";

import {
  formatDate,
  formatNumber,
} from "@/lib/format";

import {
  getTournamentData,
  type TournamentEvent,
} from "@/lib/tournaments";

export const metadata: Metadata = {
  title: "Torneos y Resultados | Card Meta",

  description:
    "Resultados de Meta Weekly y torneos comunitarios de Yu-Gi-Oh! Duel Links. Podios Top 4 y Top 8 conectados con mazos públicos reales de PostgreSQL.",
};

type OrganizerFilter =
  | "all"
  | "meta-weekly"
  | "community";

interface TournamentsPageProps {
  searchParams: Promise<{
    org?: string;
  }>;
}

const ORGANIZER_TABS: {
  key: OrganizerFilter;

  label: string;

  href: string;
}[] = [
  {
    key: "all",
    label: "Todos",
    href: "/tournaments",
  },
  {
    key: "meta-weekly",
    label: "Meta Weekly",
    href: "/tournaments?org=meta-weekly",
  },
  {
    key: "community",
    label: "Comunidad",
    href: "/tournaments?org=community",
  },
];

function resolveFilter(
  value?: string
): OrganizerFilter {
  if (
    value === "meta-weekly" ||
    value === "community"
  ) {
    return value;
  }

  return "all";
}

function matchesFilter(
  event: TournamentEvent,
  filter: OrganizerFilter
): boolean {
  if (filter === "meta-weekly") {
    return event.organizer === "Meta Weekly";
  }

  if (filter === "community") {
    return event.organizer === "Comunidad";
  }

  return true;
}

interface MetricProps {
  value: string;

  label: string;
}

function Metric({ value, label }: MetricProps) {
  return (
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
      "
    >
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

export default async function TournamentsPage({
  searchParams,
}: TournamentsPageProps) {
  const params = await searchParams;

  const filter = resolveFilter(params.org);

  const data = await getTournamentData();

  const events = data.events.filter((event) =>
    matchesFilter(event, filter)
  );

  const metaWeeklyCount = data.events.filter(
    (event) => event.organizer === "Meta Weekly"
  ).length;

  const communityCount = data.events.filter(
    (event) => event.organizer === "Comunidad"
  ).length;

  const counts: Record<OrganizerFilter, number> = {
    all: data.events.length,
    "meta-weekly": metaWeeklyCount,
    community: communityCount,
  };

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
                Torneos
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
                Resultados de Meta Weekly y
                torneos comunitarios de Speed
                Duel. Cada podio enlaza la lista
                pública del jugador cuando está
                disponible.
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

                Último evento{" "}
                {formatDate(data.updatedAt)}
              </span>

              <div className="flex flex-wrap items-center gap-1.5">
                <Metric
                  value={String(data.events.length)}
                  label="eventos"
                />

                <Metric
                  value={formatNumber(
                    data.totalPlayers
                  )}
                  label="jugadores"
                />

                <Metric
                  value={String(
                    data.totalPublicLists
                  )}
                  label="mazos reales"
                />
              </div>
            </div>
          </div>

          <section
            aria-label="Sobre los resultados"
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
                  border-emerald-500/30
                  bg-emerald-500/10
                  text-emerald-300
                "
              >
                <Database className="h-4 w-4" />
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
                  Podios conectados a mazos
                  públicos
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
                  Las listas exactas se abren
                  desde PostgreSQL y conservan el
                  botón de clonado del mazo. Si un
                  jugador no publicó su deck,
                  mostramos la lista pública del
                  arquetipo o el acceso directo a
                  sus mazos.
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
                  value={String(metaWeeklyCount)}
                  label="meta weekly"
                />

                <Metric
                  value={String(communityCount)}
                  label="comunidad"
                />
              </div>
            </div>
          </section>
        </header>

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
          <div className="flex flex-wrap items-center gap-1.5">
            {ORGANIZER_TABS.map((tab) => {
              const active = tab.key === filter;

              return (
                <Link
                  key={tab.key}
                  href={tab.href}
                  aria-current={
                    active ? "page" : undefined
                  }
                  className={`
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-md
                    border
                    px-2.5
                    py-1.5
                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.14em]
                    transition-colors
                    ${
                      active
                        ? "border-blue-400/60 bg-blue-500/15 text-white"
                        : "border-slate-700/70 bg-[#0B132B] text-slate-400 hover:border-blue-400/40 hover:text-slate-200"
                    }
                  `}
                >
                  {tab.key === "meta-weekly" ? (
                    <Trophy className="h-3 w-3" />
                  ) : tab.key === "community" ? (
                    <Users className="h-3 w-3" />
                  ) : (
                    <Swords className="h-3 w-3" />
                  )}

                  {tab.label}

                  <span
                    className={`
                      rounded
                      px-1
                      text-[8px]
                      tabular-nums
                      ${
                        active
                          ? "bg-white/10 text-white"
                          : "bg-slate-800 text-slate-500"
                      }
                    `}
                  >
                    {counts[tab.key]}
                  </span>
                </Link>
              );
            })}
          </div>

          <span
            className="
              inline-flex
              items-center
              gap-1
              px-1
              text-[9px]
              font-black
              uppercase
              tracking-[0.16em]
              text-slate-500
            "
          >
            <Layers className="h-3 w-3" />

            {events.length}{" "}
            {events.length === 1
              ? "evento"
              : "eventos"}
          </span>
        </div>

        {events.length === 0 ? (
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
            <Trophy className="h-8 w-8 text-slate-600" />

            <p className="text-sm font-bold text-slate-300">
              No hay torneos en esta categoría.
            </p>

            <p className="max-w-sm text-xs text-slate-500">
              Prueba con otro organizador o vuelve
              al listado completo.
            </p>

            <Link
              href="/tournaments"
              className="
                mt-1
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
              Ver todos los torneos
            </Link>
          </section>
        ) : (
          <section
            aria-label="Resultados de torneos"
            className="space-y-3"
          >
            {events.map((event) => (
              <TournamentResultCard
                key={event.slug}
                event={event}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
