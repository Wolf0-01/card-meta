"use client";

import {
  ChevronDown,
  RotateCcw,
  Search,
  UserRound,
  X,
} from "lucide-react";

interface GlobalSkillsControlsProps {
  search: string;

  character: string;

  characters: string[];

  onSearchChange: (value: string) => void;

  onCharacterChange: (value: string) => void;

  onReset: () => void;

  autoFocus?: boolean;
}

/**
 * Controles de Skills del buscador global.
 *
 * Mantienen el mismo aspecto que el catálogo de `/cards`
 * pero trabajan con estado controlado y sin `searchParams`.
 */
export default function GlobalSkillsControls({
  search,
  character,
  characters,
  onSearchChange,
  onCharacterChange,
  onReset,
  autoFocus = false,
}: GlobalSkillsControlsProps) {
  const hasFilters =
    search.trim().length > 0 ||
    character.length > 0;

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
            placeholder="Search skills..."
            maxLength={80}
            aria-label="Buscar habilidades por nombre o efecto"
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
              onCharacterChange(
                event.target.value
              )
            }
            aria-label="Filtrar habilidades por personaje"
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
            Filtros activos
          </span>

          <button
            type="button"
            onClick={onReset}
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
            Limpiar
          </button>
        </div>
      )}
    </div>
  );
}
