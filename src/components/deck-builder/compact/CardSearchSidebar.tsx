"use client";

import {
  useEffect,
  useState,
} from "react";

import type {
  CardPreviewData,
} from "@/types/CardPreviewData";

import type { DeckZone } from "@/types/deck";

import {
  getDefaultDraftZone,
} from "@/lib/decks/draft";

import MiniCardTile from "./MiniCardTile";

const PAGE_SIZE = 30;

const TYPE_OPTIONS = [
  {
    value: "",
    label: "Todos",
  },
  {
    value: "Monster",
    label: "Monstruos",
  },
  {
    value: "Spell",
    label: "Mágicas",
  },
  {
    value: "Trap",
    label: "Trampas",
  },
] as const;

const ATTRIBUTE_OPTIONS = [
  {
    value: "",
    label: "Atributo",
  },
  {
    value: "DARK",
    label: "DARK",
  },
  {
    value: "LIGHT",
    label: "LIGHT",
  },
  {
    value: "EARTH",
    label: "EARTH",
  },
  {
    value: "WATER",
    label: "WATER",
  },
  {
    value: "FIRE",
    label: "FIRE",
  },
  {
    value: "WIND",
    label: "WIND",
  },
  {
    value: "DIVINE",
    label: "DIVINE",
  },
] as const;

interface CardsApiResponse {
  cards?: CardPreviewData[];

  total?: number;

  page?: number;

  pages?: number;
}

interface CardSearchSidebarProps {
  copiesById: Record<number, number>;

  onAddCard: (
    card: CardPreviewData,
    zone?: DeckZone
  ) => void;

  className?: string;
}

const fieldClasses = `
  w-full
  rounded-lg
  border
  border-border
  bg-surface
  px-2.5
  py-1.5
  text-xs
  text-foreground
  outline-none
  transition-colors
  placeholder:text-foreground-muted
  focus:border-primary
  focus:ring-2
  focus:ring-primary/20
`;

export default function CardSearchSidebar({
  copiesById,
  onAddCard,
  className = "",
}: CardSearchSidebarProps) {
  const [search, setSearch] = useState("");

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState("");

  const [type, setType] = useState("");

  const [attribute, setAttribute] =
    useState("");

  const [page, setPage] = useState(1);

  const [cards, setCards] = useState<
    CardPreviewData[]
  >([]);

  const [total, setTotal] = useState(0);

  const [pages, setPages] = useState(1);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState<
    string | null
  >(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());

      setPage(1);
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCards() {
      setLoading(true);

      setError(null);

      try {
        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),

          page: String(page),
        });

        if (debouncedSearch) {
          params.set(
            "search",
            debouncedSearch
          );
        }

        if (type) {
          params.set("type", type);
        }

        if (attribute) {
          params.set(
            "attribute",
            attribute
          );
        }

        const response = await fetch(
          `/api/cards?${params.toString()}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            "No se pudieron cargar las cartas."
          );
        }

        const data =
          (await response.json()) as CardsApiResponse;

        if (controller.signal.aborted) {
          return;
        }

        setCards(
          Array.isArray(data.cards)
            ? data.cards
            : []
        );

        setTotal(data.total ?? 0);

        setPages(
          Math.max(data.pages ?? 1, 1)
        );
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }

        setCards([]);

        setTotal(0);

        setPages(1);

        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar las cartas."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadCards();

    return () => {
      controller.abort();
    };
  }, [
    debouncedSearch,
    type,
    attribute,
    page,
  ]);

  const canGoBack = page > 1;

  const canGoForward = page < pages;

  return (
    <aside
      className={`
        flex
        min-h-0
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-border
        bg-background-secondary
        ${className}
      `}
    >
      <header className="space-y-2 border-b border-border p-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-black text-foreground">
            Buscar cartas
          </h2>

          <span className="text-[10px] font-semibold text-foreground-muted">
            Clic para añadir
          </span>
        </div>

        <div className="relative">
          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Nombre de la carta..."
            className={`${fieldClasses} pr-8`}
            maxLength={80}
            aria-label="Buscar cartas por nombre"
          />

          {search && (
            <button
              type="button"
              aria-label="Limpiar búsqueda"
              onClick={() => setSearch("")}
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
                bg-surface-hover
                text-[11px]
                text-foreground-muted
                transition-colors
                hover:text-foreground
              "
            >
              ×
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select
            value={type}
            onChange={(event) => {
              setType(event.target.value);

              setPage(1);
            }}
            className={fieldClasses}
            aria-label="Filtrar por tipo de carta"
          >
            {TYPE_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={attribute}
            onChange={(event) => {
              setAttribute(
                event.target.value
              );

              setPage(1);
            }}
            className={fieldClasses}
            aria-label="Filtrar por atributo"
          >
            {ATTRIBUTE_OPTIONS.map(
              (option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              )
            )}
          </select>
        </div>

        <div className="flex items-center justify-between text-[10px] text-foreground-muted">
          <span>
            {loading
              ? "Buscando..."
              : `${total.toLocaleString(
                  "es-ES"
                )} cartas`}
          </span>

          <button
            type="button"
            onClick={() => {
              setSearch("");

              setType("");

              setAttribute("");

              setPage(1);
            }}
            className="
              font-semibold
              text-foreground-muted
              transition-colors
              hover:text-primary
            "
          >
            Reiniciar filtros
          </button>
        </div>
      </header>

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          p-2.5
        "
      >
        {error && (
          <p
            role="alert"
            className="
              rounded-lg
              border
              border-red-500/40
              bg-red-500/10
              p-2
              text-[11px]
              text-red-200
            "
          >
            {error}
          </p>
        )}

        {!error && cards.length === 0 && !loading && (
          <div
            className="
              flex
              h-full
              min-h-[140px]
              flex-col
              items-center
              justify-center
              gap-1
              rounded-lg
              border
              border-dashed
              border-border
              p-4
              text-center
              text-[11px]
              text-foreground-muted
            "
          >
            <span className="text-2xl">
              🔎
            </span>

            <p>
              No se encontraron cartas con
              estos filtros.
            </p>
          </div>
        )}

        {cards.length > 0 && (
          <div
            className="
              grid
              grid-cols-[repeat(auto-fill,minmax(88px,1fr))]
              justify-items-center
              gap-2
            "
          >
            {cards.map((card) => (
              <MiniCardTile
                key={card.id}
                card={card}
                quantity={copiesById[card.id]}
                onClick={() =>
                  onAddCard(
                    card,
                    getDefaultDraftZone(card)
                  )
                }
              />
            ))}
          </div>
        )}

        {loading && cards.length > 0 && (
          <p className="py-2 text-center text-[10px] text-foreground-muted">
            Actualizando resultados...
          </p>
        )}
      </div>

      <footer className="flex items-center justify-between gap-2 border-t border-border p-2.5">
        <button
          type="button"
          onClick={() =>
            setPage((current) =>
              Math.max(current - 1, 1)
            )
          }
          disabled={!canGoBack || loading}
          className="
            rounded-md
            border
            border-border
            px-2.5
            py-1
            text-xs
            font-semibold
            text-foreground-secondary
            transition-colors
            hover:border-primary
            hover:text-foreground
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          ←
        </button>

        <span className="text-[10px] font-semibold text-foreground-muted">
          Página {page} de {pages}
        </span>

        <button
          type="button"
          onClick={() =>
            setPage((current) =>
              Math.min(current + 1, pages)
            )
          }
          disabled={!canGoForward || loading}
          className="
            rounded-md
            border
            border-border
            px-2.5
            py-1
            text-xs
            font-semibold
            text-foreground-secondary
            transition-colors
            hover:border-primary
            hover:text-foreground
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          →
        </button>
      </footer>
    </aside>
  );
}
