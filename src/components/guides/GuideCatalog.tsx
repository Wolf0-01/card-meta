"use client";

import { useMemo, useState } from "react";

import {
  ArrowDownWideNarrow,
  BookOpen,
  Search,
} from "lucide-react";

import GuidePanoramaCard from "@/components/guides/GuidePanoramaCard";

import type { GuideListItem } from "@/lib/guides";

type SortKey = "date" | "title";

interface GuideCatalogProps {
  guides: GuideListItem[];
}

export default function GuideCatalog({
  guides,
}: GuideCatalogProps) {
  const [query, setQuery] = useState("");

  const [sort, setSort] =
    useState<SortKey>("date");

  const filtered = useMemo(() => {
    const normalized = query
      .trim()
      .toLowerCase();

    const result =
      normalized.length === 0
        ? guides
        : guides.filter((guide) => {
            const haystack = [
              guide.title,
              guide.summary,
              guide.author,
              ...guide.tags,
            ]
              .join(" ")
              .toLowerCase();

            return haystack.includes(normalized);
          });

    return [...result].sort((a, b) => {
      if (sort === "title") {
        return a.title.localeCompare(b.title);
      }

      return b.createdAt.localeCompare(
        a.createdAt
      );
    });
  }, [guides, query, sort]);

  return (
    <section
      aria-label="Recent guides"
      className="space-y-3"
    >
      <div
        className="
          flex
          flex-wrap
          items-center
          gap-2
          rounded-xl
          border
          border-slate-700/60
          bg-[#0B132B]
          p-2.5
          ring-1
          ring-inset
          ring-white/5
        "
      >
        <div className="relative min-w-[200px] flex-1">
          <Search
            aria-hidden
            className="
              pointer-events-none
              absolute
              left-2.5
              top-1/2
              h-3.5
              w-3.5
              -translate-y-1/2
              text-slate-500
            "
          />

          <input
            type="search"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search for a guide..."
            aria-label="Search for a guide"
            className="
              h-9
              w-full
              rounded-lg
              border
              border-slate-700/70
              bg-[#070D1F]
              pl-8
              pr-3
              text-xs
              text-slate-200
              placeholder:text-slate-500
              outline-none
              transition-colors
              focus:border-blue-400/70
              focus:ring-1
              focus:ring-blue-400/30
            "
          />
        </div>

        <label
          className="
            inline-flex
            h-9
            items-center
            gap-1.5
            rounded-lg
            border
            border-slate-700/70
            bg-[#070D1F]
            px-2.5
            text-[9px]
            font-black
            uppercase
            tracking-[0.14em]
            text-slate-400
          "
        >
          <ArrowDownWideNarrow className="h-3.5 w-3.5 text-blue-300" />

          <span className="sr-only">
            Sort guides
          </span>

          <select
            value={sort}
            onChange={(event) =>
              setSort(
                event.target.value as SortKey
              )
            }
            aria-label="Sort guides"
            className="
              cursor-pointer
              bg-transparent
              text-[9px]
              font-black
              uppercase
              tracking-[0.14em]
              text-slate-300
              outline-none
            "
          >
            <option
              value="date"
              className="bg-[#0B132B] text-slate-200"
            >
              Date
            </option>

            <option
              value="title"
              className="bg-[#0B132B] text-slate-200"
            >
              Title
            </option>
          </select>
        </label>

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
            ? "guide"
            : "guides"}
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
          <BookOpen className="h-8 w-8 text-slate-600" />

          <p className="text-sm font-bold text-slate-300">
            No guides match your search.
          </p>

          <p className="max-w-sm text-xs text-slate-500">
            Try a different archetype, author, or
            keyword.
          </p>
        </div>
      ) : (
        <div
          className="
            grid
            grid-cols-1
            gap-4
            md:grid-cols-2
          "
        >
          {filtered.map((guide) => (
            <GuidePanoramaCard
              key={guide.slug}
              guide={guide}
            />
          ))}
        </div>
      )}
    </section>
  );
}
