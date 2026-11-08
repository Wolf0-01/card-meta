"use client";

import {
  useCallback,
  useEffect,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  X,
} from "lucide-react";

import {
  CATALOG_TABS,
  type CatalogTab,
} from "./catalogTabs";

interface CatalogHeaderProps {
  activeTab: CatalogTab;
}

export default function CatalogHeader({
  activeTab,
}: CatalogHeaderProps) {
  const router = useRouter();

  const closeCatalog = useCallback(() => {
    if (window.history.length > 1) {
      router.back();

      return;
    }

    router.push("/");
  }, [router]);

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        closeCatalog();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [closeCatalog]);

  return (
    <header
      className="
        shrink-0
        border-b
        border-slate-700/60
        bg-[#0B132B]/95
        px-3
        sm:px-4
      "
    >
      <div className="flex items-center justify-between gap-2">
        <nav
          aria-label="Secciones del catálogo"
          className="
            flex
            items-end
            gap-0.5
            overflow-x-auto
          "
        >
          {CATALOG_TABS.map((tab) => {
            const active =
              tab.value === activeTab;

            const href =
              tab.value === "cards"
                ? "/cards"
                : `/cards?tab=${tab.value}`;

            return (
              <Link
                key={tab.value}
                href={href}
                scroll={false}
                aria-current={
                  active ? "page" : undefined
                }
                className={`
                  relative
                  shrink-0
                  px-2.5
                  py-2.5
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.18em]
                  transition-colors
                  sm:px-3
                  ${
                    active
                      ? "text-white"
                      : "text-slate-500 hover:text-slate-200"
                  }
                `}
              >
                {tab.label}

                {active && (
                  <span
                    className="
                      absolute
                      inset-x-1
                      bottom-0
                      h-0.5
                      rounded-full
                      bg-blue-500
                      shadow-[0_0_12px_rgba(59,130,246,0.95)]
                    "
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          aria-label="Cerrar catálogo"
          onClick={closeCatalog}
          className="
            flex
            h-7
            w-7
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-slate-700
            bg-slate-800/60
            text-slate-400
            transition-colors
            hover:border-red-500/60
            hover:bg-red-500/10
            hover:text-red-300
          "
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}
