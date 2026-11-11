"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface GlobalPaginationProps {
  currentPage: number;

  totalPages: number;

  total: number;

  itemLabel?: string;

  onPageChange: (page: number) => void;
}

type PageItem =
  | number
  | "ellipsis-start"
  | "ellipsis-end";

function buildPageItems(
  current: number,
  total: number
): PageItem[] {
  if (total <= 7) {
    return Array.from(
      { length: total },
      (_, index) => index + 1
    );
  }

  if (current <= 4) {
    return [
      1,
      2,
      3,
      4,
      5,
      "ellipsis-end",
      total,
    ];
  }

  if (current >= total - 3) {
    return [
      1,
      "ellipsis-start",
      total - 4,
      total - 3,
      total - 2,
      total - 1,
      total,
    ];
  }

  return [
    1,
    "ellipsis-start",
    current - 1,
    current,
    current + 1,
    "ellipsis-end",
    total,
  ];
}

/**
 * Paginación controlada del buscador global.
 *
 * A diferencia de `CardsPagination`, no lee ni escribe
 * `searchParams`: el estado de página vive en el modal y
 * así el buscador puede abrirse desde cualquier ruta sin
 * alterar la URL actual.
 */
export default function GlobalPagination({
  currentPage,
  totalPages,
  total,
  itemLabel = "cartas",
  onPageChange,
}: GlobalPaginationProps) {
  const pages = Math.max(totalPages, 1);

  const current = Math.min(
    Math.max(currentPage, 1),
    pages
  );

  return (
    <div
      className="
        flex
        flex-col
        gap-2
        sm:flex-row
        sm:items-center
        sm:justify-between
      "
    >
      <div className="flex items-center gap-1 overflow-x-auto">
        <button
          type="button"
          aria-label="Página anterior"
          onClick={() =>
            onPageChange(
              Math.max(current - 1, 1)
            )
          }
          disabled={current <= 1}
          className="
            flex
            h-7
            w-7
            shrink-0
            items-center
            justify-center
            rounded-md
            border
            border-slate-700
            bg-[#070D1F]
            text-slate-400
            transition-colors
            hover:border-blue-500/60
            hover:text-white
            disabled:cursor-not-allowed
            disabled:opacity-35
          "
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {buildPageItems(current, pages).map(
          (item) => {
            if (typeof item !== "number") {
              return (
                <span
                  key={item}
                  aria-hidden
                  className="
                    flex
                    h-7
                    w-5
                    shrink-0
                    items-center
                    justify-center
                    text-[10px]
                    font-bold
                    text-slate-600
                  "
                >
                  …
                </span>
              );
            }

            const active = item === current;

            return (
              <button
                key={item}
                type="button"
                aria-label={`Página ${item}`}
                aria-current={
                  active ? "page" : undefined
                }
                onClick={() => onPageChange(item)}
                className={`
                  flex
                  h-7
                  min-w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-md
                  border
                  px-2
                  text-[10px]
                  font-bold
                  tabular-nums
                  transition-colors
                  ${
                    active
                      ? "border-blue-400 bg-blue-500 text-white shadow-[0_0_14px_rgba(59,130,246,0.8)]"
                      : "border-slate-700 bg-[#070D1F] text-slate-400 hover:border-blue-500/60 hover:text-white"
                  }
                `}
              >
                {item}
              </button>
            );
          }
        )}

        <button
          type="button"
          aria-label="Página siguiente"
          onClick={() =>
            onPageChange(
              Math.min(current + 1, pages)
            )
          }
          disabled={current >= pages}
          className="
            flex
            h-7
            w-7
            shrink-0
            items-center
            justify-center
            rounded-md
            border
            border-slate-700
            bg-[#070D1F]
            text-slate-400
            transition-colors
            hover:border-blue-500/60
            hover:text-white
            disabled:cursor-not-allowed
            disabled:opacity-35
          "
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <p
        className="
          shrink-0
          text-right
          text-[10px]
          font-semibold
          tracking-wide
          text-slate-400
        "
      >
        <span className="tabular-nums text-slate-200">
          {total}
        </span>{" "}
        {itemLabel}
      </p>
    </div>
  );
}
