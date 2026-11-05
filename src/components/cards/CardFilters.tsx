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
  cardFilterConfig,
} from "@/config/cardFilterConfig";

import type {
  CardFiltersState,
} from "@/types/card-filters";

const inputClass = `
  bg-zinc-800
  border
  border-zinc-700
  rounded-xl
  p-3
  text-sm
  text-white
  outline-none
  focus:border-blue-500
`;

const emptyFilters: CardFiltersState = {
  search: "",
  type: "",
  attribute: "",
  rarity: "",
  level: "",
  monsterType: "",
  archetype: "",
  scale: "",
  linkMarkers: "",
  minAtk: "",
  maxAtk: "",
  minDef: "",
  maxDef: "",
};

function readFilters(
  params: ReturnType<typeof useSearchParams>
): CardFiltersState {
  return {
    search: params.get("search") ?? "",
    type: params.get("type") ?? "",
    attribute: params.get("attribute") ?? "",
    rarity: params.get("rarity") ?? "",
    level: params.get("level") ?? "",
    monsterType: params.get("monsterType") ?? "",
    archetype: params.get("archetype") ?? "",
    scale: params.get("scale") ?? "",
    linkMarkers: params.get("linkMarkers") ?? "",
    minAtk: params.get("minAtk") ?? "",
    maxAtk: params.get("maxAtk") ?? "",
    minDef: params.get("minDef") ?? "",
    maxDef: params.get("maxDef") ?? "",
  };
}

export default function CardFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] =
    useState<CardFiltersState>(() =>
      readFilters(searchParams)
    );

  const pendingPush =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  useEffect(() => {
    return () => {
      if (pendingPush.current) {
        clearTimeout(pendingPush.current);
      }
    };
  }, []);

  function pushFilters(next: CardFiltersState) {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    for (const [key, value] of Object.entries(
      next
    ) as [keyof CardFiltersState, string][]) {
      if (value.trim()) {
        params.set(key, value.trim());
      } else {
        params.delete(key);
      }
    }

    params.delete("page");

    const query = params.toString();

    router.push(
      query ? `${pathname}?${query}` : pathname,
      { scroll: false }
    );
  }

  function updateFilter(
    key: keyof CardFiltersState,
    value: string,
    debounce = false
  ) {
    const next = {
      ...filters,
      [key]: value,
    };

    setFilters(next);

    if (pendingPush.current) {
      clearTimeout(pendingPush.current);
      pendingPush.current = null;
    }

    if (debounce) {
      pendingPush.current = setTimeout(
        () => pushFilters(next),
        300
      );
    } else {
      pushFilters(next);
    }
  }

  function clearFilters() {
    if (pendingPush.current) {
      clearTimeout(pendingPush.current);
      pendingPush.current = null;
    }

    setFilters(emptyFilters);
    router.push(pathname, { scroll: false });
  }

  return (
    <div
      className="
        grid
        grid-cols-2
        gap-3
        rounded-xl
        border
        border-zinc-700
        bg-zinc-900
        p-4
        md:grid-cols-4
      "
    >
      <input
        value={filters.search}
        onChange={(event) =>
          updateFilter(
            "search",
            event.target.value,
            true
          )
        }
        placeholder="Buscar carta..."
        className={inputClass}
      />

      {cardFilterConfig.map((filter) => (
        <select
          key={filter.key}
          value={
            filters[
              filter.key as keyof CardFiltersState
            ] ?? ""
          }
          onChange={(event) =>
            updateFilter(
              filter.key as keyof CardFiltersState,
              event.target.value
            )
          }
          className={inputClass}
        >
          <option value="">
            {filter.label}
          </option>

          {filter.options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>
      ))}

      <input
        value={filters.archetype}
        onChange={(event) =>
          updateFilter(
            "archetype",
            event.target.value,
            true
          )
        }
        placeholder="Arquetipo"
        className={inputClass}
      />

      <input
        type="number"
        value={filters.minAtk}
        onChange={(event) =>
          updateFilter(
            "minAtk",
            event.target.value,
            true
          )
        }
        placeholder="ATK mínimo"
        className={inputClass}
      />

      <input
        type="number"
        value={filters.maxAtk}
        onChange={(event) =>
          updateFilter(
            "maxAtk",
            event.target.value,
            true
          )
        }
        placeholder="ATK máximo"
        className={inputClass}
      />

      <input
        type="number"
        value={filters.minDef}
        onChange={(event) =>
          updateFilter(
            "minDef",
            event.target.value,
            true
          )
        }
        placeholder="DEF mínimo"
        className={inputClass}
      />

      <input
        type="number"
        value={filters.maxDef}
        onChange={(event) =>
          updateFilter(
            "maxDef",
            event.target.value,
            true
          )
        }
        placeholder="DEF máximo"
        className={inputClass}
      />

      <button
        type="button"
        onClick={clearFilters}
        className="
          rounded-xl
          border
          border-zinc-700
          bg-zinc-800
          p-3
          text-sm
          font-medium
          text-zinc-300
          transition-colors
          hover:border-red-500
          hover:text-red-300
        "
      >
        Limpiar filtros
      </button>
    </div>
  );
}
