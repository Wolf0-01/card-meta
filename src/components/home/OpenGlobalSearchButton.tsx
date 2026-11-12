"use client";

import {
  Search,
} from "lucide-react";

interface OpenGlobalSearchButtonProps {
  className?: string;
}

/**
 * Abre el buscador global montado en el Navbar sin
 * navegar ni cambiar la ruta actual.
 */
export default function OpenGlobalSearchButton({
  className,
}: OpenGlobalSearchButtonProps) {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(
          new Event("card-meta:open-search")
        );
      }}
      aria-keyshortcuts="Control+K"
      className={className}
    >
      <Search className="h-3.5 w-3.5 shrink-0 text-blue-300" />

      <span>CARD SEARCH</span>

      <kbd
        className="
          ml-auto
          hidden
          rounded
          border
          border-slate-700/80
          bg-[#070D1F]
          px-1.5
          py-0.5
          font-sans
          text-[8px]
          font-black
          tracking-wide
          text-slate-400
          sm:inline-flex
        "
      >
        Ctrl K
      </kbd>
    </button>
  );
}
