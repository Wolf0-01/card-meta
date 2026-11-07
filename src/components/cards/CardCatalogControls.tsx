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
  { value: "", label: "Todos" },
  { value: "Monster", label: "Monstruos" },
  { value: "Spell", label: "Mágicas" },
  { value: "Trap", label: "Trampas" },
] as const;

const ATTRIBUTE_OPTIONS = [
  { value: "", label: "Atributo" },
  { value: "DARK", label: "DARK" },
  { value: "LIGHT", label: "LIGHT" },
  { value: "EARTH", label: "EARTH" },
  { value: "WATER", label: "WATER" },
  { value: "FIRE", label: "FIRE" },
  { value: "WIND", label: "WIND" },
  { value: "DIVINE", label: "DIVINE" },
] as const;

const RARITY_OPTIONS = [
  { value: "", label: "Rareza" },
  { value: "UR", label: "UR" },
  { value: "SR", label: "SR" },
  { value: "R", label: "R" },
  { value: "N", label: "N" },
] as const;

const LEVEL_OPTIONS = [
  { value: "", label: "Nivel" },
  ...Array.from(
    { length: 12 },
    (_, index) => ({
      value: String(index + 1),
      label: `Nivel ${index + 1}`,
    })
  ),
];

const SORT_OPTIONS = [
  { value: "popularity", label: "Popularity" },
  { value: "name", label: "Nombre (A-Z)" },
  { value: "attack", label: "ATK" },
  { value: "defense", label: "DEF" },
  { value: "level", label: "Nivel" },
] as const;

const controlClasses = `
  h-8
  rounded-md
  border
  border-slate-700/80
  bg-[#070D1F]
  px-2
  text-[11px]
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

  const mode =
    searchParams.get("mode") === "rush"
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
        py-2.5
        sm:px-5
      "
    >
      <div className="space-y-2">
        <div className="relative">
          <Search
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              h-4
              w-4
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
            aria-label="Buscar cartas por nombre"
            className="
              h-10
              w-full
              rounded-lg
              border
              border-slate-700/80
              bg-[#070D1F]
              pl-9
              pr-9
              text-sm
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
              aria-label="Limpiar búsqueda"
              onClick={clearSearch}
              className="
                absolute
                right-2
                top-1/2
                flex
                h-6
                w-6
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
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {(
            [
              {
                value: "speed",
                label: "Speed",
                hint: "Duel Links",
              },
              {
                value: "rush",
                label: "Rush",
                hint: "Rush Duel",
              },
            ] as const
          ).map((item) => {
            const active =
              item.value === mode;

            return (
              <button
                key={item.value}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  pushParams(
                    {
                      mode: item.value,
                    },
                    false
                  )
                }
                className={`
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-md
                  border
                  px-3
                  py-1.5
                  transition-colors
                  ${
                    active
                      ? "border-blue-400/80 bg-blue-500/10 text-blue-200 shadow-[inset_0_1px_0_rgba(59,130,246,0.25)]"
                      : "border-slate-700/80 bg-[#070D1F] text-slate-500 hover:border-slate-600 hover:text-slate-300"
                  }
                `}
              >
                <span
                  className="
                    text-[11px]
                    font-black
                    uppercase
                    tracking-[0.18em]
                  "
                >
                  {item.label}
                </span>

                <span
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-wide
                    opacity-60
                  "
                >
                  {item.hint}
                </span>
              </button>
            );
          })}
        </div>

        {mode === "rush" && (
          <p className="text-[10px] font-semibold text-amber-300/80">
            Rush Duel: catálogo en preparación.
            Se muestran las cartas de Speed.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
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
                gap-1.5
                ${
                  activeFilters > 0
                    ? "border-blue-500/60 text-blue-200"
                    : ""
                }
              `}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />

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
                aria-label="Filtros del catálogo"
                className="
                  absolute
                  left-0
                  top-full
                  z-30
                  mt-2
                  w-[min(22rem,calc(100vw-2rem))]
                  rounded-xl
                  border
                  border-slate-700
                  bg-[#0B132B]
                  p-3
                  shadow-2xl
                "
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
                      Tipo
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
                    <span className="mb-1 block text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
                      Atributo
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
                    <span className="mb-1 block text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
                      Rareza
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
                    <span className="mb-1 block text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
                      Nivel
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
                    mt-3
                    w-full
                    rounded-md
                    border
                    border-slate-700
                    px-3
                    py-1.5
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
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
                left-2
                top-1/2
                h-3.5
                w-3.5
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
              aria-label="Ordenar cartas"
              className={`
                ${controlClasses}
                appearance-none
                pl-7
                pr-7
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
                right-2
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
              h-8
              items-center
              gap-1.5
              rounded-md
              border
              border-slate-700/80
              bg-[#070D1F]
              px-2
              text-[10px]
              font-black
              tracking-wide
              text-slate-300
              transition-colors
              hover:border-blue-500/60
              hover:text-white
            "
          >
            <ArrowUpDown className="h-3.5 w-3.5" />

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
                h-8
                items-center
                gap-1
                rounded-md
                px-2
                text-[10px]
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
    </div>
  );
}
