import type { Metadata } from "next";

import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  Layers,
  Newspaper,
} from "lucide-react";

import NewsCatalog from "@/components/news/NewsCatalog";

import { formatDate } from "@/lib/format";

import { getNewsArticles } from "@/lib/news";

import { NEWS_CATEGORIES } from "@/lib/newsCategories";

export const metadata: Metadata = {
  title: "News, Leaks & Banlist | Card Meta",

  description:
    "News, leaks and banlist analysis for Yu-Gi-Oh! Duel Links. Editorial content with real cards from the catalog and direct access to every article.",
};

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

interface NewsPageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

export default async function NewsPage({
  searchParams,
}: NewsPageProps) {
  const { category } = await searchParams;

  const requestedCategory =
    category?.toLowerCase();

  const initialCategory =
    NEWS_CATEGORIES.find(
      (item) => item.key === requestedCategory
    )?.key ?? "all";

  const articles = await getNewsArticles();

  const latest = articles[0];

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
                Card Meta · Editorial
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
                News, Leaks &amp; Banlist
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
                Leaks, game news and banlist analysis
                for Yu-Gi-Oh! Duel Links. Every article
                links the real cards from the catalog.
                Looking for deck guides? Visit the{" "}
                <Link
                  href="/guides"
                  className="
                    font-bold
                    text-blue-300
                    transition-colors
                    hover:text-blue-200
                  "
                >
                  Guides Collection
                </Link>
                .
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

                Updated{" "}
                {formatDate(latest?.publishedAt)}
              </span>

              <div className="flex items-center gap-1.5">
                <Metric
                  value={String(articles.length)}
                  label="articles"
                />

                <Metric
                  value={String(
                    NEWS_CATEGORIES.length
                  )}
                  label="categories"
                />
              </div>
            </div>
          </div>

          <section
            aria-label="About the editorial content"
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
                <Newspaper className="h-4 w-4" />
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
                  Curated content, real cards
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
                  Articles combine editorial coverage
                  with data from the PostgreSQL
                  catalog. Banners come from official
                  sets, and featured cards open their
                  full page with an interactive
                  tooltip.
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
                  value={String(
                    NEWS_CATEGORIES.length
                  )}
                  label="sections"
                />

                <Metric
                  value={String(
                    new Set(
                      articles.map(
                        (article) =>
                          article.category
                      )
                    ).size
                  )}
                  label="active"
                />
              </div>
            </div>
          </section>
        </header>

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
            Latest articles
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
            Sorted by date
          </span>
        </div>

        <NewsCatalog
          articles={articles}
          initialCategory={initialCategory}
        />
      </div>
    </main>
  );
}
