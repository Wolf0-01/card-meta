"use client";

import Image from "next/image";

import {
  useEffect,
  useState,
} from "react";

import {
  Loader2,
  Plus,
  Search,
  X,
} from "lucide-react";

import type { GuideEditorCard } from "@/lib/guides/editor";

import type { CardPreviewData } from "@/types/CardPreviewData";

const CARD_PAGE_SIZE = 12;

interface CardsApiResponse {
  cards?: CardPreviewData[];
}

interface GuideCardPickerProps {
  selected: GuideEditorCard[];

  onChange: (cards: GuideEditorCard[]) => void;
}

function toEditorCard(
  card: CardPreviewData
): GuideEditorCard {
  return {
    name: card.name,

    slug: card.slug,

    image: card.image,
  };
}

function CardThumbnail({
  card,
  className = "",
}: {
  card: GuideEditorCard;

  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  const imageSrc =
    failed || !card.image
      ? "/cards/default.jpg"
      : card.image;

  return (
    <Image
      src={imageSrc}
      alt={card.name}
      fill
      sizes="96px"
      unoptimized={failed}
      draggable={false}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}

export default function GuideCardPicker({
  selected,
  onChange,
}: GuideCardPickerProps) {
  const [search, setSearch] = useState("");

  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  const [results, setResults] = useState<
    CardPreviewData[]
  >([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  const selectedNames = new Set(
    selected.map((card) => card.name)
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [search]);

  useEffect(() => {
    if (debouncedSearch.length < 2) {
      /*
       * La UI ya muestra la pista de búsqueda en este
       * caso; no hace falta limpiar el estado desde el
       * efecto (evita renders en cascada).
       */
      return;
    }

    const controller = new AbortController();

    async function loadCards() {
      setLoading(true);

      setError(null);

      try {
        const params = new URLSearchParams({
          search: debouncedSearch,

          limit: String(CARD_PAGE_SIZE),

          page: "1",

          format: "speed",
        });

        const response = await fetch(
          `/api/cards?${params.toString()}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            "Could not load the cards."
          );
        }

        const data =
          (await response.json()) as CardsApiResponse;

        if (controller.signal.aborted) {
          return;
        }

        setResults(
          Array.isArray(data.cards)
            ? data.cards
            : []
        );
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }

        setResults([]);

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load the cards."
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
  }, [debouncedSearch]);

  function addCard(card: CardPreviewData) {
    if (selectedNames.has(card.name)) {
      return;
    }

    onChange([
      ...selected,
      toEditorCard(card),
    ]);
  }

  function removeCard(name: string) {
    onChange(
      selected.filter(
        (card) => card.name !== name
      )
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <p
          className="
            text-[9px]
            font-black
            uppercase
            tracking-[0.16em]
            text-slate-400
          "
        >
          Featured cards in the section
        </p>

        <span
          className="
            rounded
            border
            border-slate-700/70
            bg-[#070D1F]
            px-1.5
            py-0.5
            text-[8px]
            font-black
            tabular-nums
            text-slate-500
          "
        >
          {selected.length}
        </span>
      </div>

      <div className="relative">
        <Search
          aria-hidden
          className="
            pointer-events-none
            absolute
            left-2.5
            top-1/2
            h-3.5
            w-3.5
            -translate-y-1/2
            text-slate-500
          "
        />

        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search a card for this section..."
          aria-label="Search a card for this section"
          className="
            h-9
            w-full
            rounded-lg
            border
            border-slate-700/70
            bg-[#070D1F]
            pl-8
            pr-3
            text-xs
            text-slate-200
            placeholder:text-slate-500
            outline-none
            transition-colors
            focus:border-blue-400/70
            focus:ring-1
            focus:ring-blue-400/30
          "
        />
      </div>

      {selected.length > 0 && (
        <div
          className="
            grid
            grid-cols-4
            gap-1.5
            sm:grid-cols-6
            lg:grid-cols-8
          "
        >
          {selected.map((card) => (
            <div
              key={card.name}
              className="
                group
                relative
                overflow-hidden
                rounded-lg
                border
                border-emerald-500/30
                bg-[#070D1F]
              "
            >
              <div className="relative aspect-[59/86] overflow-hidden bg-slate-900">
                <CardThumbnail card={card} />
              </div>

              <button
                type="button"
                onClick={() =>
                  removeCard(card.name)
                }
                aria-label={`Remove ${card.name}`}
                title={`Remove ${card.name}`}
                className="
                  absolute
                  right-1
                  top-1
                  flex
                  h-5
                  w-5
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/20
                  bg-black/80
                  text-white
                  opacity-0
                  transition-all
                  group-hover:opacity-100
                  hover:bg-red-600
                "
              >
                <X className="h-3 w-3" />
              </button>

              <p
                className="
                  truncate
                  px-1.5
                  py-1
                  text-[8px]
                  font-bold
                  text-slate-400
                "
                title={card.name}
              >
                {card.name}
              </p>
            </div>
          ))}
        </div>
      )}

      {debouncedSearch.length < 2 ? (
        <p className="text-[10px] leading-relaxed text-slate-500">
          Type at least two characters to search
          the catalog and add real thumbnails.
        </p>
      ) : loading ? (
        <p className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <Loader2 className="h-3 w-3 animate-spin" />
          Searching cards...
        </p>
      ) : error ? (
        <p className="text-[10px] text-red-300">
          {error}
        </p>
      ) : results.length === 0 ? (
        <p className="text-[10px] text-slate-500">
          No cards match “
          {debouncedSearch}”.
        </p>
      ) : (
        <div
          className="
            grid
            grid-cols-4
            gap-1.5
            sm:grid-cols-6
            lg:grid-cols-8
          "
        >
          {results.map((card) => {
            const alreadySelected =
              selectedNames.has(card.name);

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => addCard(card)}
                disabled={alreadySelected}
                title={
                  alreadySelected
                    ? `${card.name} is already added`
                    : `Add ${card.name}`
                }
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-lg
                  border
                  border-slate-700/70
                  bg-[#070D1F]
                  text-left
                  transition-colors
                  hover:border-blue-400/70
                  disabled:cursor-not-allowed
                  disabled:opacity-35
                "
              >
                <span className="relative block aspect-[59/86] overflow-hidden bg-slate-900">
                  <CardThumbnail
                    card={toEditorCard(card)}
                    className="
                      transition-transform
                      duration-150
                      group-hover:scale-[1.04]
                    "
                  />

                  <span
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      flex
                      items-center
                      justify-center
                      bg-black/0
                      opacity-0
                      transition
                      duration-150
                      group-hover:bg-black/45
                      group-hover:opacity-100
                    "
                  >
                    <span
                      className="
                        flex
                        h-6
                        w-6
                        items-center
                        justify-center
                        rounded-full
                        bg-emerald-500
                        text-emerald-950
                        shadow-lg
                      "
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </span>
                  </span>
                </span>

                <span
                  className="
                    block
                    truncate
                    px-1.5
                    py-1
                    text-[8px]
                    font-bold
                    text-slate-400
                  "
                  title={card.name}
                >
                  {card.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
