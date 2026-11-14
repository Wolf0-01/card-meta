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
  ArrowDownAZ,
  ArrowUpDown,
  ChevronDown,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

const TYPE_OPTIONS = [
  { value: "", label: "All" },
  { value: "Monster", label: "Monsters" },
  { value: "Spell", label: "Spells" },
  { value: "Trap", label: "Traps" },
] as const;

const ATTRIBUTE_OPTIONS = [
  { value: "", label: "Attribute" },
  { value: "DARK", label: "DARK" },
  { value: "LIGHT", label: "LIGHT" },
  { value: "EARTH", label: "EARTH" },
  { value: "WATER", label: "WATER" },
  { value: "FIRE", label: "FIRE" },
  { value: "WIND", label: "WIND" },
  { value: "DIVINE", label: "DIVINE" },
] as const;

const RARITY_OPTIONS = [
  { value: "", label: "Rarity" },
  { value: "UR", label: "UR" },
  { value: "SR", label: "SR" },
  { value: "R", label: "R" },
  { value: "N", label: "N" },
] as const;

const LEVEL_OPTIONS = [
  { value: "", label: "Level" },
  ...Array.from(
    { length: 12 },
    (_, index) => ({
      value: String(index + 1),
      label: `Level ${index + 1}`,
    })
  ),
];

const SORT_OPTIONS = [
  { value: "popularity", label: "Popularity" },
  { value: "name", label: "Name (A-Z)" },
  { value: "attack", label: "ATK" },
  { value: "defense", label: "DEF" },
  { value: "level", label: "Level" },
] as const;

const controlClasses = `
  h-7
  rounded
  border
  border-slate-700/80
  bg-[#070D1F]
  px-1.5
  text-[10px]
  font-bold
  text-slate-300
  outline-none
  transition-colors
  hover:border-slate-600
  focus:border-blue-400
  focus:ring-2
  focus:ring-blue-500/20
`;

export default function CardCatalogControls() {
  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  const paramSearch =
    searchParams.get("search") ?? "";

  const [search, setSearch] =
    useState(paramSearch);

  const [filtersOpen, setFiltersOpen] =
    useState(false);

  const searchTimer =
    useRef<number | null>(null);

  const lastPushedSearch = useRef(
    paramSearch
  );

  const filterRef =
    useRef<HTMLDivElement>(null);

  const format =
    searchParams.get("format") === "rush"
      ? "rush"
      : "speed";

  const sort =
    searchParams.get("sort") ??
    "popularity";

  const direction =
    searchParams.get("direction") === "desc"
      ? "desc"
      : "asc";

  const type =
    searchParams.get("type") ?? "";

  const attribute =
    searchParams.get("attribute") ?? "";

  const rarity =
    searchParams.get("rarity") ?? "";

  const level =
    searchParams.get("level") ?? "";

  const activeFilters = [
    type,
    attribute,
    rarity,
    level,
  ].filter(Boolean).length;

  const hasActiveSearch =
    search.trim().length > 0;

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

  useEffect(() => {
    if (!filtersOpen) {
      return;
    }

    function handlePointerDown(
      event: PointerEvent
    ) {
      if (
        filterRef.current &&
        !filterRef.current.contains(
          event.target as Node
        )
      ) {
        setFiltersOpen(false);
      }
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setFiltersOpen(false);
      }
    }

    window.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "pointerdown",
        handlePointerDown
      );

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [filtersOpen]);

  function pushParams(
    updates: Record<string, string>,
    resetPage = true
  ) {
    const params = new URLSearchParams(
      window.location.search
    );

    for (const [key, value] of Object.entries(
      updates
    )) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    if (resetPage) {
      params.delete("page");
    }

    const query = params.toString();

    router.push(
      query
        ? `${pathname}?${query}`
        : pathname,
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

  function resetFilters() {
    if (searchTimer.current) {
      window.clearTimeout(
        searchTimer.current
      );

      searchTimer.current = null;
    }

    setSearch("");

    lastPushedSearch.current = "";

    setFiltersOpen(false);

    router.push(pathname, { scroll: false });
  }

  function updateFilter(
    key: string,
    value: string
  ) {
    pushParams({ [key]: value });
  }

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
            placeholder="Search cards..."
            maxLength={80}
            aria-label="Search cards by name"
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

        <div
          className="
            flex
            shrink-0
            overflow-hidden
            rounded-md
            border
            border-slate-700/80
            bg-[#070D1F]
          "
        >
          {(
            [
              { value: "speed", label: "Speed" },
              { value: "rush", label: "Rush" },
            ] as const
          ).map((item, index) => {
            const active =
              item.value === format;

            return (
              <button
                key={item.value}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  pushParams({
                    format:
                      item.value === "rush"
                        ? "rush"
                        : "",
                  })
                }
                className={`
                  flex
                  h-8
                  items-center
                  px-2.5
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.14em]
                  transition-colors
                  ${
                    index > 0
                      ? "border-l border-slate-700/80"
                      : ""
                  }
                  ${
                    active
                      ? "bg-blue-500/15 text-blue-200"
                      : "text-slate-500 hover:text-slate-300"
                  }
                `}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="
          mt-1.5
          flex
          items-center
          gap-1
          border-t
          border-slate-800/80
          pt-1.5
        "
      >
          <div
            ref={filterRef}
            className="relative"
          >
            <button
              type="button"
              aria-expanded={filtersOpen}
              aria-haspopup="dialog"
              onClick={() =>
                setFiltersOpen(
                  (current) => !current
                )
              }
              className={`
                ${controlClasses}
                inline-flex
                items-center
                gap-1
                ${
                  activeFilters > 0
                    ? "border-blue-500/60 text-blue-200"
                    : ""
                }
              `}
            >
              <SlidersHorizontal className="h-3 w-3" />

              Filter by...

              {activeFilters > 0 && (
                <span
                  className="
                    flex
                    h-4
                    min-w-4
                    items-center
                    justify-center
                    rounded-full
                    bg-blue-500
                    px-1
                    text-[9px]
                    font-black
                    text-white
                  "
                >
                  {activeFilters}
                </span>
              )}

              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>

            {filtersOpen && (
              <div
                role="dialog"
                aria-label="Catalog filters"
                className="
                  absolute
                  left-0
                  top-full
                  z-30
                  mt-1.5
                  w-[min(20rem,calc(100vw-1.5rem))]
                  rounded-lg
                  border
                  border-slate-700
                  bg-[#0B132B]
                  p-2
                  shadow-2xl
                "
              >
                <div className="grid grid-cols-2 gap-1.5">
                  <label className="block">
                    <span className="mb-0.5 block text-[8px] font-black uppercase tracking-[0.14em] text-slate-500">
                      Type
                    </span>

                    <select
                      value={type}
                      onChange={(event) =>
                        updateFilter(
                          "type",
                          event.target.value
                        )
                      }
                      className={`${controlClasses} w-full`}
                    >
                      {TYPE_OPTIONS.map(
                        (option) => (
                          <option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-0.5 block text-[8px] font-black uppercase tracking-[0.14em] text-slate-500">
                      Attribute
                    </span>

                    <select
                      value={attribute}
                      onChange={(event) =>
                        updateFilter(
                          "attribute",
                          event.target.value
                        )
                      }
                      className={`${controlClasses} w-full`}
                    >
                      {ATTRIBUTE_OPTIONS.map(
                        (option) => (
                          <option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-0.5 block text-[8px] font-black uppercase tracking-[0.14em] text-slate-500">
                      Rarity
                    </span>

                    <select
                      value={rarity}
                      onChange={(event) =>
                        updateFilter(
                          "rarity",
                          event.target.value
                        )
                      }
                      className={`${controlClasses} w-full`}
                    >
                      {RARITY_OPTIONS.map(
                        (option) => (
                          <option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-0.5 block text-[8px] font-black uppercase tracking-[0.14em] text-slate-500">
                      Level
                    </span>

                    <select
                      value={level}
                      onChange={(event) =>
                        updateFilter(
                          "level",
                          event.target.value
                        )
                      }
                      className={`${controlClasses} w-full`}
                    >
                      {LEVEL_OPTIONS.map(
                        (option) => (
                          <option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        )
                      )}
                    </select>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="
                    mt-2
                    w-full
                    rounded
                    border
                    border-slate-700
                    px-2
                    py-1
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.12em]
                    text-slate-400
                    transition-colors
                    hover:border-blue-500/60
                    hover:text-blue-200
                  "
                >
                  Reiniciar filtros
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <ArrowDownAZ
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
              value={sort}
              onChange={(event) =>
                pushParams({
                  sort: event.target.value,
                })
              }
              aria-label="Sort cards"
              className={`
                ${controlClasses}
                appearance-none
                pl-6
                pr-6
              `}
            >
              {SORT_OPTIONS.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
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

          <button
            type="button"
            aria-label={
              direction === "asc"
                ? "Orden ascendente"
                : "Orden descendente"
            }
            title={
              direction === "asc"
                ? "Orden ascendente"
                : "Orden descendente"
            }
            onClick={() =>
              pushParams({
                direction:
                  direction === "asc"
                    ? "desc"
                    : "asc",
              })
            }
            className="
              inline-flex
              h-7
              items-center
              gap-1
              rounded
              border
              border-slate-700/80
              bg-[#070D1F]
              px-1.5
              text-[9px]
              font-black
              tracking-wide
              text-slate-300
              transition-colors
              hover:border-blue-500/60
              hover:text-white
            "
          >
            <ArrowUpDown className="h-3 w-3" />

            {direction === "asc"
              ? "ASC"
              : "DESC"}
          </button>

          {(activeFilters > 0 ||
            hasActiveSearch) && (
            <button
              type="button"
              onClick={resetFilters}
              title="Reiniciar filtros"
              className="
                inline-flex
                h-7
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

              <span className="hidden sm:inline">
                Reset
              </span>
            </button>
          )}
        </div>

    </div>
  );
}
