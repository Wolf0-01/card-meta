"use client";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

interface CardsPaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function CardsPagination({
  currentPage,
  totalPages,
}: CardsPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
    return null;
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }

    const query = params.toString();

    router.push(
      query ? `${pathname}?${query}` : pathname
    );
  }

  return (
    <nav
      aria-label="Paginación de cartas"
      className="
        mt-10
        flex
        items-center
        justify-center
        gap-4
      "
    >
      <button
        type="button"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="
          rounded-xl
          border
          border-zinc-700
          bg-zinc-900
          px-4
          py-2
          text-sm
          font-medium
          transition-colors
          hover:border-blue-500
          hover:bg-zinc-800
          disabled:pointer-events-none
          disabled:opacity-40
        "
      >
        ← Anterior
      </button>

      <span
        className="
          rounded-xl
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
        Página{" "}
        <span className="text-blue-400">
          {currentPage}
        </span>{" "}
        de {totalPages}
      </span>

      <button
        type="button"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="
          rounded-xl
          border
          border-zinc-700
          bg-zinc-900
          px-4
          py-2
          text-sm
          font-medium
          transition-colors
          hover:border-blue-500
          hover:bg-zinc-800
          disabled:pointer-events-none
          disabled:opacity-40
        "
      >
        Siguiente →
      </button>
    </nav>
  );
}
