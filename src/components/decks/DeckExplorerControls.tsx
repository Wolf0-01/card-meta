"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  ChevronDown,
  Loader2,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

const DEBOUNCE_MS = 300;

interface DeckExplorerControlsProps {
  initialSearch: string;

  initialSkill: string;

  skills: string[];

  total: number;
}

/**
 * Barra compacta del explorador público.
 *
 * La búsqueda se debouncea 300 ms antes de escribir la
 * URL, de modo que el servidor solo consulta una vez por
 * pausa de escritura.
 */
export default function DeckExplorerControls({
  initialSearch,
  initialSkill,
  skills,
  total,
}: DeckExplorerControlsProps) {
  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  const [search, setSearch] =
    useState(initialSearch);

  const [skill, setSkill] =
    useState(initialSkill);

  const [isPending, startTransition] =
    useTransition();

  const timerRef =
    useRef<number | null>(null);

  const lastPushedSearch =
    useRef(initialSearch);

  const lastPushedSkill =
    useRef(initialSkill);

  const paramSearch =
    searchParams.get("search") ?? "";

  const paramSkill =
    searchParams.get("skill") ?? "";

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
    if (
      paramSkill !==
      lastPushedSkill.current
    ) {
      lastPushedSkill.current = paramSkill;

      setSkill(paramSkill);
    }
  }, [paramSkill]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(
          timerRef.current
        );
      }
    };
  }, []);

  function pushParams(updates: {
    search?: string;

    skill?: string;
  }) {
    const params = new URLSearchParams(
      searchParams.toString()
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

    const query = params.toString();

    startTransition(() => {
      router.push(
        query
          ? `${pathname}?${query}`
          : pathname,
        {
          scroll: false,
        }
      );
    });
  }

  function handleSearchChange(
    value: string
  ) {
    setSearch(value);

    if (timerRef.current) {
      window.clearTimeout(
        timerRef.current
      );
    }

    timerRef.current =
      window.setTimeout(() => {
        const next = value.trim();

        if (next === paramSearch) {
          return;
        }

        lastPushedSearch.current = next;

        pushParams({
          search: next,
        });
      }, DEBOUNCE_MS);
  }

  function handleSkillChange(
    value: string
  ) {
    setSkill(value);

    lastPushedSkill.current = value;

    pushParams({
      skill: value,
    });
  }

  function resetFilters() {
    if (timerRef.current) {
      window.clearTimeout(
        timerRef.current
      );
    }

    setSearch("");

    setSkill("");

    lastPushedSearch.current = "";

    lastPushedSkill.current = "";

    pushParams({
      search: "",

      skill: "",
    });
  }

  const hasFilters =
    search.trim().length > 0 ||
    skill.length > 0;

  return (
    <section
      aria-label="Filtros del explorador de mazos"
      className="
        rounded-xl
        border
        border-slate-700/60
        bg-[#0B132B]
        p-2
        shadow-[0_14px_40px_-28px_rgba(0,0,0,0.9)]
        ring-1
        ring-inset
        ring-white/5
      "
    >
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
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
            placeholder="Buscar por nombre o arquetipo..."
            maxLength={80}
            aria-label="Buscar mazos por nombre o arquetipo"
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
              onClick={() =>
                handleSearchChange("")
              }
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

        <div className="flex items-center gap-1.5">
          <div className="relative min-w-0 flex-1 sm:flex-none">
            <span
              aria-hidden
              className="
                pointer-events-none
                absolute
                left-2
                top-1/2
                h-1.5
                w-1.5
                -translate-y-1/2
                rotate-45
                border
                border-amber-300/90
                bg-amber-400/30
                shadow-[0_0_7px_rgba(251,191,36,0.7)]
              "
            />

            <select
              value={skill}
              onChange={(event) =>
                handleSkillChange(
                  event.target.value
                )
              }
              aria-label="Filtrar mazos por skill equipada"
              className="
                h-8
                w-full
                max-w-[13rem]
                appearance-none
                rounded-md
                border
                border-slate-700/80
                bg-[#070D1F]
                pl-6
                pr-7
                text-[10px]
                font-bold
                text-slate-300
                outline-none
                transition-colors
                hover:border-slate-600
                focus:border-blue-400
                focus:ring-2
                focus:ring-blue-500/20
                sm:w-[13rem]
              "
            >
              <option value="">
                Todas las skills
              </option>

              {skills.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
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

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="
                inline-flex
                h-8
                shrink-0
                items-center
                gap-1
                rounded-md
                border
                border-slate-700/80
                bg-[#070D1F]
                px-2
                text-[9px]
                font-bold
                uppercase
                tracking-wide
                text-slate-400
                transition-colors
                hover:border-red-500/50
                hover:text-red-300
              "
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>
      </div>

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
          text-[9px]
          font-bold
          uppercase
          tracking-[0.14em]
          text-slate-500
        "
      >
        <span>
          <span className="tabular-nums text-slate-200">
            {total}
          </span>{" "}
          {total === 1 ? "mazo público" : "mazos públicos"}
        </span>

        {isPending && (
          <span className="inline-flex items-center gap-1 text-blue-300">
            <Loader2 className="h-3 w-3 animate-spin" />
            Actualizando
          </span>
        )}
      </div>
    </section>
  );
}
