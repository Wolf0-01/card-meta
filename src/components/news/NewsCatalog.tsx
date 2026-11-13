"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Newspaper,
  UserRound,
} from "lucide-react";

import { formatDate } from "@/lib/format";

import {
  getNewsCategory,
  NEWS_CATEGORIES,
  type NewsCategoryKey,
} from "@/lib/newsCategories";

import type { NewsArticle } from "@/lib/news";

type FilterKey = "all" | NewsCategoryKey;

interface NewsCatalogProps {
  articles: NewsArticle[];

  initialCategory?: FilterKey;
}

export default function NewsCatalog({
  articles,
  initialCategory = "all",
}: NewsCatalogProps) {
  const [activeFilter, setActiveFilter] =
    useState<FilterKey>(initialCategory);

  const counts = useMemo(() => {
    const result = new Map<NewsCategoryKey, number>();

    for (const article of articles) {
      result.set(
        article.category,
        (result.get(article.category) ?? 0) + 1
      );
    }

    return result;
  }, [articles]);

  const filtered = useMemo(
    () =>
      activeFilter === "all"
        ? articles
        : articles.filter(
            (article) =>
              article.category === activeFilter
          ),
    [activeFilter, articles]
  );

  return (
    <section
      aria-label="News catalog"
      className="space-y-3"
    >
      <div
        className="
          flex
          flex-wrap
          items-center
          justify-between
          gap-2
          rounded-xl
          border
          border-slate-700/60
          bg-[#0B132B]
          px-2.5
          py-2
          ring-1
          ring-inset
          ring-white/5
        "
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <FilterButton
            active={activeFilter === "all"}
            label="All"
            count={articles.length}
            onClick={() => setActiveFilter("all")}
          />

          {NEWS_CATEGORIES.map((category) => (
            <FilterButton
              key={category.key}
              active={activeFilter === category.key}
              label={category.label}
              count={counts.get(category.key) ?? 0}
              dotClass={category.dotClass}
              onClick={() =>
                setActiveFilter(category.key)
              }
            />
          ))}
        </div>

        <span
          className="
            px-1
            text-[9px]
            font-black
            uppercase
            tracking-[0.16em]
            text-slate-500
          "
        >
          {filtered.length}{" "}
          {filtered.length === 1
            ? "article"
            : "articles"}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div
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
          <Newspaper className="h-8 w-8 text-slate-600" />

          <p className="text-sm font-bold text-slate-300">
            There are no articles in this category yet.
          </p>

          <p className="max-w-sm text-xs text-slate-500">
            Try another category or return to the full
            catalog view.
          </p>
        </div>
      ) : (
        <div
          className="
            grid
            grid-cols-1
            gap-3
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {filtered.map((article) => (
            <ArticleCard
              key={article.slug}
              article={article}
            />
          ))}
        </div>
      )}
    </section>
  );
}

interface FilterButtonProps {
  active: boolean;

  label: string;

  count: number;

  dotClass?: string;

  onClick: () => void;
}

function FilterButton({
  active,
  label,
  count,
  dotClass,
  onClick,
}: FilterButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
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
            : "border-slate-700/70 bg-[#070D1F] text-slate-400 hover:border-blue-400/40 hover:text-slate-200"
        }
      `}
    >
      {dotClass ? (
        <span
          aria-hidden
          className={`h-1.5 w-1.5 rounded-full ${dotClass}`}
        />
      ) : (
        <span
          aria-hidden
          className="
            h-1.5
            w-1.5
            rounded-full
            bg-blue-300
          "
        />
      )}

      {label}

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
        {count}
      </span>
    </button>
  );
}

interface ArticleCardProps {
  article: NewsArticle;
}

function ArticleCard({ article }: ArticleCardProps) {
  const category = getNewsCategory(article.category);

  return (
    <Link
      href={`/news/${article.slug}`}
      className="
        group
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-xl
        border
        border-slate-700/60
        bg-[#0B132B]
        ring-1
        ring-inset
        ring-white/5
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-blue-400/70
        hover:shadow-[0_0_28px_rgba(59,130,246,0.18)]
      "
    >
      <div
        className="
          relative
          aspect-[16/8]
          overflow-hidden
          bg-[#070D1F]
        "
      >
        {article.bannerUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.bannerUrl}
              alt={article.bannerAlt}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
                object-center
                opacity-90
                transition-transform
                duration-300
                group-hover:scale-[1.04]
              "
            />

            <span
              aria-hidden
              className="
                absolute
                inset-0
                bg-gradient-to-t
                from-[#0B132B]
                via-[#0B132B]/25
                to-transparent
              "
            />
          </>
        ) : (
          <span
            aria-hidden
            className={`
              absolute
              inset-0
              bg-gradient-to-br
              ${category.glowClass}
            `}
          />
        )}

        <span
          className={`
            absolute
            left-2.5
            top-2.5
            inline-flex
            items-center
            gap-1
            rounded
            border
            px-1.5
            py-0.5
            text-[8px]
            font-black
            uppercase
            tracking-[0.12em]
            backdrop-blur-sm
            ${category.badgeClass}
          `}
        >
          <span
            aria-hidden
            className={`h-1 w-1 rounded-full ${category.dotClass}`}
          />

          {category.label}
        </span>

        <span
          className="
            absolute
            right-2.5
            top-2.5
            inline-flex
            items-center
            gap-1
            rounded
            border
            border-white/10
            bg-slate-950/65
            px-1.5
            py-0.5
            text-[8px]
            font-bold
            text-slate-200
            backdrop-blur-sm
          "
        >
          <CalendarDays className="h-2.5 w-2.5" />

          {formatDate(article.publishedAt)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h2
          className="
            line-clamp-2
            text-[15px]
            font-black
            leading-snug
            text-white
            transition-colors
            group-hover:text-blue-100
          "
        >
          {article.title}
        </h2>

        <p
          className="
            mt-1.5
            line-clamp-2
            text-[11px]
            leading-relaxed
            text-slate-400
          "
        >
          {article.summary}
        </p>

        <div
          className="
            mt-auto
            flex
            items-center
            justify-between
            gap-2
            border-t
            border-slate-700/50
            pt-2.5
            text-[9px]
            font-bold
            uppercase
            tracking-[0.1em]
            text-slate-500
          "
        >
          <span className="inline-flex min-w-0 items-center gap-1">
            <UserRound className="h-3 w-3 shrink-0" />

            <span className="truncate">
              {article.author}
            </span>
          </span>

          <span className="inline-flex shrink-0 items-center gap-1">
            <Clock3 className="h-3 w-3" />

            {article.readingMinutes} min
          </span>

          <span
            aria-hidden
            className="
              flex
              h-5
              w-5
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-slate-700
              bg-[#070D1F]
              text-slate-400
              transition-colors
              group-hover:border-blue-400/60
              group-hover:text-blue-200
            "
          >
            <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
