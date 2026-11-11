"use client";

import {
  useEffect,
} from "react";

import Link from "next/link";

import {
  X,
} from "lucide-react";

import {
  CATALOG_TABS,
  type CatalogTab,
} from "./catalogTabs";

import { useCloseCatalog } from "./useCloseCatalog";

interface CatalogHeaderProps {
  activeTab: CatalogTab;

  /**
   * Pestañas visibles. Por defecto muestra todas las del
   * catálogo de `/cards`; el buscador global pasa solo
   * Cards y Skills.
   */
  tabs?: ReadonlyArray<{
    value: CatalogTab;
    label: string;
  }>;

  /**
   * Cierre controlado. Cuando se proporciona, el header no
   * gestiona el scroll del body ni el atajo Escape: el
   * contenedor global se encarga de ambos.
   */
  onClose?: () => void;

  /**
   * Cambio de pestaña controlado. Si existe, las pestañas
   * se renderizan como botones en lugar de enlaces.
   */
  onTabChange?: (tab: CatalogTab) => void;
}

export default function CatalogHeader({
  activeTab,
  tabs = CATALOG_TABS,
  onClose,
  onTabChange,
}: CatalogHeaderProps) {
  const closeCatalog = useCloseCatalog();

  const handleClose = onClose ?? closeCatalog;

  useEffect(() => {
    if (onClose) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key !== "Escape") {
        return;
      }

      /*
       * Si el buscador global está abierto encima del
       * catálogo, Escape debe cerrar solo el buscador.
       */
      if (
        document.querySelector(
          "[data-global-search-modal='true']"
        )
      ) {
        return;
      }

      closeCatalog();
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
  }, [closeCatalog, onClose]);

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
          {tabs.map((tab) => {
            const active =
              tab.value === activeTab;

            const tabClassName = `
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
            `;

            const content = (
              <>
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
              </>
            );

            if (onTabChange) {
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() =>
                    onTabChange(tab.value)
                  }
                  aria-current={
                    active ? "page" : undefined
                  }
                  className={tabClassName}
                >
                  {content}
                </button>
              );
            }

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
                className={tabClassName}
              >
                {content}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          aria-label={
            onClose
              ? "Cerrar buscador"
              : "Cerrar catálogo"
          }
          onClick={handleClose}
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
