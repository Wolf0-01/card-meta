import type { Metadata } from "next";

import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  Layers,
  Plus,
  Swords,
  Trophy,
  Users,
} from "lucide-react";

import TournamentResultCard from "@/components/tournaments/TournamentResultCard";

import { getCurrentUser } from "@/lib/auth/currentUser";

import { canManageGuides } from "@/lib/auth/roles";

import {
  formatDate,
  formatNumber,
} from "@/lib/format";

import {
  getTournamentData,
  type TournamentEvent,
} from "@/lib/tournaments";

export const metadata: Metadata = {
  title: "Tournaments & Results | Card Meta",

  description:
    "Yu-Gi-Oh! Duel Links tournament results. Top 4 and Top 8 standings linked to real public deck lists.",
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
    label: "All",
    href: "/tournaments",
  },
  {
    key: "meta-weekly",
    label: "Meta Weekly",
    href: "/tournaments?org=meta-weekly",
  },
  {
    key: "community",
    label: "Community",
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
    return event.organizer === "Community";
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

  const [data, user] = await Promise.all([
    getTournamentData(),
    getCurrentUser(),
  ]);

  const events = data.events.filter((event) =>
    matchesFilter(event, filter)
  );

  const metaWeeklyCount = data.events.filter(
    (event) => event.organizer === "Meta Weekly"
  ).length;

  const communityCount = data.events.filter(
    (event) => event.organizer === "Community"
  ).length;

  const counts: Record<OrganizerFilter, number> = {
    all: data.events.length,
    "meta-weekly": metaWeeklyCount,
    community: communityCount,
  };

  const hasAnyEvents = data.events.length > 0;

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
                Home
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
                Tournaments
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
                Meta Weekly and community Speed Duel
                results. Every podium links the
                player&apos;s public deck list when it is
                available.
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
              {canManageGuides(user) && (
                <Link
                  href="/tournaments/new"
                  className="
                    inline-flex
                    h-8
                    items-center
                    gap-1.5
                    rounded-lg
                    border
                    border-blue-500/40
                    bg-blue-500/10
                    px-3
                    text-[9px]
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
                  <Plus className="h-3 w-3" />
                  Add Tournament
                </Link>
              )}

              {hasAnyEvents && (
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

                  Last event{" "}
                  {formatDate(data.updatedAt)}
                </span>
              )}

              <div className="flex flex-wrap items-center gap-1.5">
                <Metric
                  value={String(data.events.length)}
                  label="events"
                />

                <Metric
                  value={formatNumber(
                    data.totalPlayers
                  )}
                  label="players"
                />

                <Metric
                  value={String(
                    data.totalPublicLists
                  )}
                  label="public decks"
                />
              </div>
            </div>
          </div>

          <section
            aria-label="About the results"
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
                <Layers className="h-4 w-4" />
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
                  Standings linked to public decks
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
                  When a player publishes their deck,
                  the placement opens the exact list and
                  keeps the clone button. If a list is not
                  public, the placement links to the
                  archetype explorer instead.
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
                  label="community"
                />
              </div>
            </div>
          </section>
        </header>

        {hasAnyEvents && (
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
                ? "event"
                : "events"}
            </span>
          </div>
        )}

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
              {hasAnyEvents
                ? "No tournaments in this category yet."
                : "No tournaments yet."}
            </p>

            <p className="max-w-sm text-xs text-slate-500">
              {hasAnyEvents
                ? "Try another organizer or return to the full list."
                : "The next community tournaments will be published here soon."}
            </p>

            {hasAnyEvents && (
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
                View all tournaments
              </Link>
            )}
          </section>
        ) : (
          <section
            aria-label="Tournament results"
            className="space-y-3"
          >
            {events.map((event) => (
              <TournamentResultCard
                key={event.slug}
                event={event}
                canManage={canManageGuides(user)}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
