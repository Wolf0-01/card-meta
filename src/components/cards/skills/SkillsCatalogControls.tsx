"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  ChevronDown,
  RotateCcw,
  Search,
  UserRound,
  X,
} from "lucide-react";

interface SkillsCatalogControlsProps {
  characters: string[];
}

export default function SkillsCatalogControls({
  characters,
}: SkillsCatalogControlsProps) {
  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  const paramSearch =
    searchParams.get("search") ?? "";

  const character =
    searchParams.get("character") ?? "";

  const [search, setSearch] =
    useState(paramSearch);

  const searchTimer =
    useRef<number | null>(null);

  const lastPushedSearch = useRef(
    paramSearch
  );

  useEffect(() => {
    if (
      paramSearch !==
      lastPushedSearch.current
    ) {
      lastPushedSearch.current = paramSearch;

      setSearch(paramSearch);
    }
  }, [paramSearch]);

  useEffect(() => {
    return () => {
      if (searchTimer.current) {
        window.clearTimeout(
          searchTimer.current
        );
      }
    };
  }, []);

  function pushParams(
    updates: Record<string, string>
  ) {
    const params = new URLSearchParams(
      window.location.search
    );

    params.set("tab", "skills");

    for (const [key, value] of Object.entries(
      updates
    )) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    params.delete("page");

    router.push(
      `${pathname}?${params.toString()}`,
      { scroll: false }
    );
  }

  function handleSearchChange(
    value: string
  ) {
    setSearch(value);

    if (searchTimer.current) {
      window.clearTimeout(
        searchTimer.current
      );
    }

    searchTimer.current =
      window.setTimeout(() => {
        searchTimer.current = null;

        const next = value.trim();

        lastPushedSearch.current = next;

        pushParams({ search: next });
      }, 300);
  }

  function clearSearch() {
    if (searchTimer.current) {
      window.clearTimeout(
        searchTimer.current
      );

      searchTimer.current = null;
    }

    setSearch("");

    lastPushedSearch.current = "";

    pushParams({ search: "" });
  }

  function resetSkills() {
    if (searchTimer.current) {
      window.clearTimeout(
        searchTimer.current
      );

      searchTimer.current = null;
    }

    setSearch("");

    lastPushedSearch.current = "";

    router.push(`${pathname}?tab=skills`, {
      scroll: false,
    });
  }

  const hasFilters =
    search.trim().length > 0 || character.length > 0;

  return (
    <div
      className="
        shrink-0
        border-b
        border-slate-700/60
        bg-[#0B132B]
        px-3
        py-2
      "
    >
      <div className="flex items-center gap-1.5">
        <div className="relative min-w-0 flex-1">
          <Search
            className="
              pointer-events-none
              absolute
              left-2
              top-1/2
              h-3.5
              w-3.5
              -translate-y-1/2
              text-slate-500
            "
          />

          <input
            value={search}
            onChange={(event) =>
              handleSearchChange(
                event.target.value
              )
            }
            placeholder="Search skills..."
            maxLength={80}
            aria-label="Search skills by name or effect"
            className="
              h-8
              w-full
              rounded-md
              border
              border-slate-700/80
              bg-[#070D1F]
              pl-7
              pr-7
              text-[11px]
              text-slate-100
              outline-none
              transition-colors
              placeholder:text-slate-500
              focus:border-blue-400
              focus:ring-2
              focus:ring-blue-500/20
            "
          />

          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={clearSearch}
              className="
                absolute
                right-1.5
                top-1/2
                flex
                h-5
                w-5
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-slate-800
                text-slate-400
                transition-colors
                hover:text-white
              "
            >
              <X className="h-2.5 w-2.5" />
            </button>
          )}
        </div>

        <div className="relative shrink-0">
          <UserRound
            className="
              pointer-events-none
              absolute
              left-1.5
              top-1/2
              h-3
              w-3
              -translate-y-1/2
              text-slate-500
            "
          />

          <select
            value={character}
            onChange={(event) =>
              pushParams({
                character: event.target.value,
              })
            }
            aria-label="Filter skills by character"
            className="
              h-8
              max-w-[9.5rem]
              appearance-none
              rounded-md
              border
              border-slate-700/80
              bg-[#070D1F]
              pl-6
              pr-6
              text-[10px]
              font-bold
              text-slate-300
              outline-none
              transition-colors
              hover:border-slate-600
              focus:border-blue-400
              focus:ring-2
              focus:ring-blue-500/20
            "
          >
            <option value="">
              Personaje
            </option>

            {characters.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <ChevronDown
            className="
              pointer-events-none
              absolute
              right-1.5
              top-1/2
              h-3
              w-3
              -translate-y-1/2
              text-slate-500
            "
          />
        </div>
      </div>

      {hasFilters && (
        <div
          className="
            mt-1.5
            flex
            items-center
            justify-between
            gap-2
            border-t
            border-slate-800/80
            pt-1.5
          "
        >
          <span
            className="
              text-[9px]
              font-black
              uppercase
              tracking-[0.14em]
              text-slate-500
            "
          >
            Active filters
          </span>

          <button
            type="button"
            onClick={resetSkills}
            className="
              inline-flex
              h-6
              items-center
              gap-1
              rounded
              px-1.5
              text-[9px]
              font-bold
              uppercase
              tracking-wide
              text-slate-500
              transition-colors
              hover:text-red-300
            "
          >
            <RotateCcw className="h-3 w-3" />
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
