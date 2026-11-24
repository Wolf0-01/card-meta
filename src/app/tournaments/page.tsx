import type { Metadata } from "next";

import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  History,
  Pencil,
  Plus,
  Trophy,
} from "lucide-react";

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
    "Yu-Gi-Oh! Duel Links tournament reports, KC Cup rankings, and community Speed Duel results.",
};

interface TournamentsPageProps {
  searchParams: Promise<{
    org?: string;
  }>;
}

function slugifyOrganizer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface ReportTileProps {
  event: TournamentEvent;

  canEdit: boolean;

  variant?: "recent" | "archive";
}

function ReportTile({
  event,
  canEdit,
  variant = "recent",
}: ReportTileProps) {
  return (
    <div className="group relative flex items-stretch overflow-hidden rounded-lg border border-slate-700/70 bg-[#0B132B] transition-colors hover:border-sky-400/60 hover:bg-[#101C3D]">
      <Link
        href={"/tournaments/" + event.slug}
        className="flex min-w-0 flex-1 flex-col items-center justify-center px-3 py-2.5 text-center"
      >
        <span
          className="line-clamp-1 text-xs font-bold text-sky-300 transition-colors group-hover:text-white"
          title={event.name}
        >
          {event.name}
        </span>

        <span className="mt-0.5 text-[10px] italic text-slate-400">
          {formatDate(event.date)}
          {variant === "archive"
            ? " · " + formatNumber(event.players) + " players"
            : ""}
        </span>
      </Link>

      {canEdit && (
        <Link
          href={"/tournaments/" + event.slug + "/edit"}
          title={"Edit " + event.name}
          aria-label={"Edit " + event.name}
          className="flex w-8 shrink-0 items-center justify-center border-l border-slate-800 text-slate-500 transition-colors hover:bg-slate-800/70 hover:text-amber-300"
        >
          <Pencil className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

export default async function TournamentsPage({
  searchParams,
}: TournamentsPageProps) {
  const params = await searchParams;

  const activeOrg = params.org?.trim().toLowerCase() || "all";

  const [data, user] = await Promise.all([
    getTournamentData(),
    getCurrentUser(),
  ]);

  const isStaff = canManageGuides(user);

  const organizerMap = new Map<
    string,
    { key: string; label: string; count: number }
  >();

  for (const event of data.events) {
    const key = slugifyOrganizer(event.organizer) || "other";

    const existing = organizerMap.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      organizerMap.set(key, {
        key,
        label: event.organizer,
        count: 1,
      });
    }
  }

  const tabs = [
    {
      key: "all",
      label: "All",
      count: data.events.length,
      href: "/tournaments",
    },
    ...[...organizerMap.values()].map((item) => ({
      key: item.key,
      label: item.label,
      count: item.count,
      href: "/tournaments?org=" + encodeURIComponent(item.key),
    })),
  ];

  const recentEvents = data.events.slice(0, 10);

  const archiveEvents =
    activeOrg === "all"
      ? data.events
      : data.events.filter(
          (event) =>
            slugifyOrganizer(event.organizer) === activeOrg
        );

  const hasAnyEvents = data.events.length > 0;

  return (
    <main className="min-h-screen bg-[#070D1F] px-3 py-5 text-slate-100 sm:px-6 sm:py-7">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500 transition-colors hover:text-blue-300"
              >
                <ArrowLeft className="h-3 w-3" />
                Home
              </Link>

              <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
                Tournaments
              </h1>

              <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-slate-400">
                Competitive tournament reports, KC Cup
                rankings, and Speed Duel results linked to
                public deck lists.
              </p>
            </div>

            <div className="flex flex-col items-start gap-2 sm:items-end">
              {isStaff && (
                <Link
                  href="/tournaments/new"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-500/10 px-3 text-[9px] font-black uppercase tracking-[0.14em] text-blue-200 transition-colors hover:border-blue-400 hover:bg-blue-500/20 hover:text-white"
                >
                  <Plus className="h-3 w-3" />
                  Add Tournament
                </Link>
              )}

            </div>
          </div>
        </header>

        {!hasAnyEvents ? (
          <section className="rounded-xl border border-slate-700/60 bg-[#0B132B] p-8 text-center">
            <p className="text-sm font-black uppercase tracking-wider text-slate-300">
              No tournament reports published yet
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Published events and KC Cup reports will
              appear here.
            </p>
          </section>
        ) : (
          <>
            <section
              aria-label="Recent Events"
              className="space-y-3"
            >
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <Trophy className="h-4 w-4 text-amber-300" />

                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                  Recent Events
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {recentEvents.map((event) => (
                  <ReportTile
                    key={"recent-" + event.id}
                    event={event}
                    canEdit={isStaff}
                    variant="recent"
                  />
                ))}
              </div>
            </section>

            <section
              aria-label="Past Reports"
              className="space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-sky-300" />

                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                    Past Reports
                  </h2>
                </div>

                <nav
                  aria-label="Filter reports by organizer"
                  className="flex flex-wrap items-center gap-1.5"
                >
                  {tabs.map((tab) => {
                    const isActive =
                      activeOrg === tab.key;

                    const tabClass = isActive
                      ? "inline-flex items-center gap-1.5 rounded-md border border-sky-400/70 bg-sky-500/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-sky-200 transition-colors"
                      : "inline-flex items-center gap-1.5 rounded-md border border-slate-700/70 bg-[#0B132B] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-200";

                    return (
                      <Link
                        key={tab.key}
                        href={tab.href}
                        className={tabClass}
                      >
                        <span>{tab.label}</span>

                        <span className="tabular-nums opacity-75">
                          {tab.count}
                        </span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {archiveEvents.map((event) => (
                  <ReportTile
                    key={"archive-" + event.id}
                    event={event}
                    canEdit={isStaff}
                    variant="archive"
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
