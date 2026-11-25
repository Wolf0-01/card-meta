import type { Metadata } from "next";

import Link from "next/link";

import { notFound } from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  Info,
  Pencil,
  Swords,
  Trophy,
  Users,
} from "lucide-react";

import TournamentDescription from "@/components/tournaments/TournamentDescription";

import TournamentDeckLists from "@/components/tournaments/TournamentDeckLists";

import { getCurrentUser } from "@/lib/auth/currentUser";

import { canManageGuides } from "@/lib/auth/roles";

import {
  formatDate,
  formatNumber,
} from "@/lib/format";

import { getTournamentBySlug } from "@/lib/tournaments";

interface TournamentPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: TournamentPageProps): Promise<Metadata> {
  const { slug } = await params;

  const tournament = await getTournamentBySlug(slug);

  if (!tournament) {
    return {
      title: "Tournament not found | Card Meta",
    };
  }

  return {
    title: `${tournament.name} | Tournaments | Card Meta`,

    description: `${tournament.name} results: ${tournament.organizer}, ${tournament.format}, ${tournament.players} players.`,
  };
}

export default async function TournamentPage({
  params,
}: TournamentPageProps) {
  const { slug } = await params;

  const [tournament, user] = await Promise.all([
    getTournamentBySlug(slug),

    getCurrentUser(),
  ]);

  if (!tournament) {
    notFound();
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/tournaments"
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
            Back to Tournaments
          </Link>

          {canManageGuides(user) && (
            <Link
              href={`/tournaments/${tournament.slug}/edit`}
              className="
                inline-flex
                h-8
                items-center
                gap-1.5
                rounded-lg
                border
                border-slate-700/70
                bg-[#0B132B]
                px-3
                text-[9px]
                font-black
                uppercase
                tracking-[0.14em]
                text-slate-300
                transition-colors
                hover:border-blue-400/60
                hover:text-white
              "
            >
              <Pencil className="h-3 w-3" />
              Edit
            </Link>
          )}
        </div>

        <header
          className="
            relative
            overflow-hidden
            rounded-2xl
            border
            border-slate-700/60
            bg-[#0B132B]
            ring-1
            ring-inset
            ring-white/5
          "
        >
          {tournament.bannerUrl && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tournament.bannerUrl}
                alt={`${tournament.name} banner`}
                referrerPolicy="no-referrer"
                className="
                  absolute
                  inset-0
                  h-full
                  w-full
                  object-cover
                  object-center
                  opacity-70
                "
              />

              <span
                aria-hidden
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-[#070D1F]
                  via-[#070D1F]/80
                  to-[#070D1F]/30
                "
              />
            </>
          )}

          <div
            className="
              relative
              flex
              min-h-[200px]
              flex-col
              justify-end
              gap-2
              p-4
              sm:min-h-[240px]
              sm:p-6
            "
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className="
                  inline-flex
                  items-center
                  gap-1
                  rounded
                  border
                  border-amber-400/30
                  bg-amber-400/10
                  px-1.5
                  py-0.5
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.12em]
                  text-amber-200
                  backdrop-blur-sm
                "
              >
                <Trophy className="h-2.5 w-2.5" />
                {tournament.organizer}
              </span>

              <span
                className="
                  inline-flex
                  items-center
                  gap-1
                  rounded
                  border
                  border-white/10
                  bg-slate-950/60
                  px-1.5
                  py-0.5
                  text-[8px]
                  font-bold
                  text-slate-200
                  backdrop-blur-sm
                "
              >
                <CalendarDays className="h-2.5 w-2.5" />
                {formatDate(tournament.date)}
              </span>

              <span
                className="
                  inline-flex
                  items-center
                  gap-1
                  rounded
                  border
                  border-white/10
                  bg-slate-950/60
                  px-1.5
                  py-0.5
                  text-[8px]
                  font-bold
                  text-slate-200
                  backdrop-blur-sm
                "
              >
                <Swords className="h-2.5 w-2.5" />
                {tournament.format}
              </span>

              <span
                className="
                  inline-flex
                  items-center
                  gap-1
                  rounded
                  border
                  border-white/10
                  bg-slate-950/60
                  px-1.5
                  py-0.5
                  text-[8px]
                  font-bold
                  text-slate-200
                  backdrop-blur-sm
                "
              >
                <Users className="h-2.5 w-2.5" />
                {formatNumber(tournament.players)} players
              </span>
            </div>

            <h1
              className="
                max-w-3xl
                text-2xl
                font-black
                uppercase
                leading-tight
                tracking-tight
                text-white
                sm:text-4xl
              "
            >
              {tournament.name}
            </h1>

            <p
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.16em]
                text-slate-400
              "
            >
              Top {tournament.topCount} ·{" "}
              {tournament.publicListCount} public{" "}
              {tournament.publicListCount === 1
                ? "list"
                : "lists"}
            </p>
          </div>
        </header>

        {tournament.description?.trim() && (
          <section
            aria-label="Tournament information"
            className="
              overflow-hidden
              rounded-xl
              border
              border-slate-700/60
              bg-[#0B132B]
              ring-1
              ring-inset
              ring-white/5
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
                border-b
                border-slate-800
                px-3
                py-2.5
              "
            >
              <Info className="h-4 w-4 text-blue-300" />

              <h2
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-slate-200
                "
              >
                Tournament Information
              </h2>
            </div>

            <div
              className="
                px-3
                py-3
                text-[12.5px]
                leading-7
                text-slate-300
              "
            >
              <TournamentDescription text=             {tournament.description} 
             />
            </div>
          </section>
        )}

        <TournamentDeckLists
          decks={tournament.podiumDecks}
        />
      </div>
    </main>
  );
}
