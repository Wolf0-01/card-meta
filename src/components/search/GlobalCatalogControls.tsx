"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowDownAZ,
  ArrowUpDown,
  ChevronDown,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import {
  CARD_ATTRIBUTE_OPTIONS,
  CARD_CONTROL_CLASSES,
  CARD_LEVEL_OPTIONS,
  CARD_RARITY_OPTIONS,
  CARD_SORT_OPTIONS,
  CARD_TYPE_OPTIONS,
  type CardFilterKey,
} from "./cardFilterOptions";

interface GlobalCatalogControlsProps {
  search: string;

  type: string;

  attribute: string;

  rarity: string;

  level: string;

  sort: string;

  direction: "asc" | "desc";

  onSearchChange: (value: string) => void;

  onFilterChange: (
    key: CardFilterKey,
    value: string
  ) => void;

  onSortChange: (value: string) => void;

  onDirectionToggle: () => void;

  onReset: () => void;

  autoFocus?: boolean;
}

/**
 * Controles de cartas del buscador global.
 *
 * Son totalmente controlados: la búsqueda se debouncea en
 * `GlobalCardSearch` y los filtros actualizan su estado
 * local en lugar de `searchParams`.
 */
export default function GlobalCatalogControls({
  search,
  type,
  attribute,
  rarity,
  level,
  sort,
  direction,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onDirectionToggle,
  onReset,
  autoFocus = false,
}: GlobalCatalogControlsProps) {
  const [filtersOpen, setFiltersOpen] =
    useState(false);

  const filterRef =
    useRef<HTMLDivElement>(null);

  const activeFilters = [
    type,
    attribute,
    rarity,
    level,
  ].filter(Boolean).length;

  const hasActiveSearch =
    search.trim().length > 0;

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

  function handleReset() {
    setFiltersOpen(false);

    onReset();
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
              onSearchChange(
                event.target.value
              )
            }
            placeholder="Search cards..."
            maxLength={80}
            aria-label="Buscar cartas por nombre"
            autoFocus={autoFocus}
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
              aria-label="Limpiar búsqueda"
              onClick={() => onSearchChange("")}
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
              ${CARD_CONTROL_CLASSES}
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
              aria-label="Filtros del buscador global"
              data-global-filter-popover="true"
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
                    Tipo
                  </span>

                  <select
                    value={type}
                    onChange={(event) =>
                      onFilterChange(
                        "type",
                        event.target.value
                      )
                    }
                    className={`${CARD_CONTROL_CLASSES} w-full`}
                  >
                    {CARD_TYPE_OPTIONS.map(
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
                    Atributo
                  </span>

                  <select
                    value={attribute}
                    onChange={(event) =>
                      onFilterChange(
                        "attribute",
                        event.target.value
                      )
                    }
                    className={`${CARD_CONTROL_CLASSES} w-full`}
                  >
                    {CARD_ATTRIBUTE_OPTIONS.map(
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
                    Rareza
                  </span>

                  <select
                    value={rarity}
                    onChange={(event) =>
                      onFilterChange(
                        "rarity",
                        event.target.value
                      )
                    }
                    className={`${CARD_CONTROL_CLASSES} w-full`}
                  >
                    {CARD_RARITY_OPTIONS.map(
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
                    Nivel
                  </span>

                  <select
                    value={level}
                    onChange={(event) =>
                      onFilterChange(
                        "level",
                        event.target.value
                      )
                    }
                    className={`${CARD_CONTROL_CLASSES} w-full`}
                  >
                    {CARD_LEVEL_OPTIONS.map(
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
                onClick={handleReset}
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
              onSortChange(event.target.value)
            }
            aria-label="Ordenar cartas"
            className={`
              ${CARD_CONTROL_CLASSES}
              appearance-none
              pl-6
              pr-6
            `}
          >
            {CARD_SORT_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
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
          onClick={onDirectionToggle}
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
            onClick={handleReset}
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
