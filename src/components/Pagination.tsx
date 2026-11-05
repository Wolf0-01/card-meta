"use client";

import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;

  createPageUrl: (
    page: number
  ) => string;
}

export default function Pagination({
  currentPage,
  totalPages,
  createPageUrl,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className="
        mt-10
        flex
        items-center
        justify-center
        gap-4
      "
    >
      {/* Previous */}

      <Link
        href={
          currentPage > 1
            ? createPageUrl(currentPage - 1)
            : "#"
        }
        aria-disabled={currentPage === 1}
        className={`
          rounded-lg
          border
          px-4
          py-2
          text-sm
          font-medium
          transition

          ${
            currentPage === 1
              ? "pointer-events-none border-zinc-800 bg-zinc-900 opacity-40"
              : "border-zinc-700 bg-zinc-900 hover:border-blue-500 hover:bg-zinc-800"
          }
        `}
      >
        ← Previous
      </Link>

      {/* Current */}

      <span
        className="
          rounded-lg
          border
          border-zinc-700
          bg-zinc-950
          px-5
          py-2
          text-sm
          font-semibold
          text-white
        "
      >
        Page {currentPage} of {totalPages}
      </span>

      {/* Next */}

      <Link
        href={
          currentPage < totalPages
            ? createPageUrl(currentPage + 1)
            : "#"
        }
        aria-disabled={
          currentPage === totalPages
        }
        className={`
          rounded-lg
          border
          px-4
          py-2
          text-sm
          font-medium
          transition

          ${
            currentPage === totalPages
              ? "pointer-events-none border-zinc-800 bg-zinc-900 opacity-40"
              : "border-zinc-700 bg-zinc-900 hover:border-blue-500 hover:bg-zinc-800"
          }
        `}
      >
        Next →
      </Link>
    </nav>
  );
}