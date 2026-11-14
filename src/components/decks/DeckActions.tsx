"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Button from "@/components/ui/Button";

import { MetaDeck } from "@/types/meta";

import { exportDeckAsYdk } from "@/services/decks/export";

import { buildYdk } from "@/utils/exportDeck";

interface Props {
  deck: MetaDeck;
}

type CopiedKind = "link" | "ydk" | null;

export default function DeckActions({
  deck,
}: Props) {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const [copied, setCopied] =
    useState<CopiedKind>(null);

  const menuRef =
    useRef<HTMLDivElement>(null);

  const copyTimer = useRef<
    number | null
  >(null);

  /*
   * El menú se cierra al hacer clic fuera de él
   * o al pulsar Escape.
   */
  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handlePointerDown(
      event: PointerEvent
    ) {
      const menu = menuRef.current;

      if (
        menu &&
        !menu.contains(
          event.target as Node
        )
      ) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [menuOpen]);

  useEffect(() => {
    return () => {
      if (copyTimer.current !== null) {
        window.clearTimeout(
          copyTimer.current
        );
      }
    };
  }, []);

  function flashCopied(
    kind: Exclude<CopiedKind, null>
  ) {
    setCopied(kind);

    if (copyTimer.current !== null) {
      window.clearTimeout(
        copyTimer.current
      );
    }

    copyTimer.current =
      window.setTimeout(() => {
        setCopied(null);

        copyTimer.current = null;
      }, 1600);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(
      window.location.href
    );

    flashCopied("link");
  }

  async function copyYdk() {
    await navigator.clipboard.writeText(
      buildYdk(deck.cards)
    );

    flashCopied("ydk");
  }

  function downloadYdk() {
    exportDeckAsYdk(deck);

    setMenuOpen(false);
  }

  return (
    <div
      className="
        flex
        items-center
        gap-2
      "
    >
      <Button
        variant="primary"
        href={`/decks/new?clone=${deck.identifier}`}
        className="
          flex-1
          py-2.5
        "
      >
        Build in Deck Builder
      </Button>

      <div
        ref={menuRef}
        className="
          relative
          flex-1
        "
      >
        <Button
          variant="secondary"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() =>
            setMenuOpen((open) => !open)
          }
          className="
            w-full
            py-2.5
          "
        >
          Share...

          <span
            aria-hidden
            className="
              ml-1
              text-[10px]
            "
          >
            ▾
          </span>
        </Button>

        {menuOpen && (
          <div
            role="menu"
            aria-label="Share deck"
            className="
              absolute
              right-0
              top-full
              z-30
              mt-2
              w-full
              min-w-[220px]
              overflow-hidden
              rounded-xl
              border
              border-border
              bg-surface
              shadow-xl
            "
          >
            <button
              type="button"
              role="menuitem"
              onClick={copyLink}
              className="
                flex
                w-full
                items-center
                justify-between
                gap-2
                px-3
                py-2.5
                text-left
                text-xs
                font-semibold
                text-foreground
                transition-colors
                hover:bg-primary/10
                hover:text-primary
              "
            >
              <span>
                {copied === "link"
                  ? "Enlace copiado"
                  : "Copiar enlace"}
              </span>

              {copied === "link" && (
                <span
                  aria-hidden
                  className="text-emerald-400"
                >
                  ✓
                </span>
              )}
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={copyYdk}
              className="
                flex
                w-full
                items-center
                justify-between
                gap-2
                border-t
                border-border
                px-3
                py-2.5
                text-left
                text-xs
                font-semibold
                text-foreground
                transition-colors
                hover:bg-primary/10
                hover:text-primary
              "
            >
              <span>
                {copied === "ydk"
                  ? "YDK copiado"
                  : "Copiar YDK al portapapeles"}
              </span>

              {copied === "ydk" && (
                <span
                  aria-hidden
                  className="text-emerald-400"
                >
                  ✓
                </span>
              )}
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={downloadYdk}
              className="
                flex
                w-full
                items-center
                justify-between
                gap-2
                border-t
                border-border
                px-3
                py-2.5
                text-left
                text-xs
                font-semibold
                text-foreground
                transition-colors
                hover:bg-primary/10
                hover:text-primary
              "
            >
              <span>
                Descargar archivo .ydk
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
