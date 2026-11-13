import type { Metadata } from "next";

import Link from "next/link";

import {
  ArrowLeft,
  BookOpen,
  Flame,
  Sparkles,
  UserRound,
} from "lucide-react";

import GuideCatalog from "@/components/guides/GuideCatalog";

import GuidePanoramaCard from "@/components/guides/GuidePanoramaCard";

import {
  getFeaturedGuides,
  getGuides,
} from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guides Collection | Card Meta",

  description:
    "In-depth Yu-Gi-Oh! Duel Links guides: deck lists, combos, ratios, and matchup plans written by the Card Meta team.",
};

export default async function GuidesPage() {
  const [guides, featured] = await Promise.all([
    getGuides(),
    getFeaturedGuides(),
  ]);

  const authors = new Set(
    guides.map((guide) => guide.author)
  ).size;

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
          space-y-6
        "
      >
        <div className="flex items-center justify-between gap-2">
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

          <span
            className="
              text-[9px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-slate-500
            "
          >
            Card Meta · Editorial
          </span>
        </div>

        <header className="space-y-3 text-center">
          <p
            className="
              text-[9px]
              font-black
              uppercase
              tracking-[0.3em]
              text-blue-300
            "
          >
            Guides Collection
          </p>

          <h1
            className="
              text-3xl
              font-black
              uppercase
              tracking-[0.16em]
              text-white
              sm:text-5xl
            "
          >
            Guides
          </h1>

          <p
            className="
              mx-auto
              max-w-2xl
              text-[11px]
              leading-relaxed
              text-slate-400
              sm:text-xs
            "
          >
            Deck lists, combo lines, ratios, and matchup
            plans for Yu-Gi-Oh! Duel Links. Every guide
            links real cards from the PostgreSQL catalog.
          </p>

          <div
            className="
              flex
              flex-wrap
              items-center
              justify-center
              gap-1.5
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
              <BookOpen className="h-3 w-3 text-sky-300" />
              {guides.length} guides
            </span>

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
              <UserRound className="h-3 w-3 text-blue-300" />
              {authors} authors
            </span>

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
              <Sparkles className="h-3 w-3 text-amber-300" />
              {featured.length} featured
            </span>
          </div>
        </header>

        {featured.length > 0 && (
          <section
            aria-labelledby="most-popular"
            className="space-y-3"
          >
            <div
              className="
                flex
                items-center
                gap-2
                border-b
                border-slate-800
                pb-2
              "
            >
              <Flame className="h-3.5 w-3.5 text-amber-300" />

              <h2
                id="most-popular"
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-slate-200
                "
              >
                Most Popular
              </h2>

              <span
                className="
                  ml-auto
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-slate-500
                "
              >
                Featured guides
              </span>
            </div>

            <div
              className="
                grid
                grid-cols-1
                gap-4
                md:grid-cols-2
              "
            >
              {featured
                .slice(0, 4)
                .map((guide) => (
                  <GuidePanoramaCard
                    key={guide.slug}
                    guide={guide}
                    aspectClassName="aspect-[21/9]"
                    showSummary
                  />
                ))}
            </div>
          </section>
        )}

        <section
          aria-labelledby="recent-guides"
          className="space-y-3"
        >
          <div
            className="
              flex
              items-center
              gap-2
              border-b
              border-slate-800
              pb-2
            "
          >
            <BookOpen className="h-3.5 w-3.5 text-blue-300" />

            <h2
              id="recent-guides"
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.2em]
                text-slate-200
              "
            >
              Recent Guides
            </h2>

            <span
              className="
                ml-auto
                text-[9px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-slate-500
              "
            >
              Sorted by date or title
            </span>
          </div>

          <GuideCatalog guides={guides} />
        </section>
      </div>
    </main>
  );
}
